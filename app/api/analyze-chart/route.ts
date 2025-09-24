import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/geminiService';
import { PrismaClient, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Configure for static export
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, symbol, timeframe, additionalContext, fileType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Get user from token
    let userId: string | null = null;
    const cookieToken = req.cookies.get('auth')?.value;
    if (cookieToken) {
      try {
        const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
        const decoded = jwt.verify(String(cookieToken || ''), secret) as any;
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // Check user credits if authenticated
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          credits: true, 
          isActive: true 
        }
      });

      if (!user || !user.isActive) {
        return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
      }

      if (user.credits < 1) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
      }
    }

    // Save image to disk (public/uploads) and get URL
    let savedImageUrl = 'mock-image-url';
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const extension = (fileType && typeof fileType === 'string' && fileType.includes('/'))
        ? fileType.split('/')[1]
        : 'png';
      const filename = `${randomUUID()}.${extension}`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(imageBase64, 'base64');
      const bytes = new Uint8Array(buffer);
      await fs.writeFile(filePath, bytes);
      savedImageUrl = `/uploads/${filename}`;
    } catch (e) {
      console.error('Failed to persist uploaded image, continuing with analysis:', e);
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('No Gemini 2.5 Flash API key configured, returning mock data for testing');
      // Return comprehensive mock data for testing when no API key is configured
      const mockAnalysis = {
        symbol: symbol || 'BTC/USDT',
        pattern: 'Bullish Consolidation / Potential Bullish Flag Breakout',
        trend: 'bullish',
        entryPrice: '109.000',
        targetPrice: '112.800',
        stopLoss: '106.800',
        confidence: 85,
        analysis: 'BTC/USDT on the 4-hour chart has demonstrated strong bullish momentum, breaking above a key resistance level around $104,800 with significant volume. Following this breakout, the price consolidated around the $107,000-$109,000 range, potentially forming a bullish flag or pennant pattern. The current candle shows renewed buying pressure, suggesting a potential breakout continuation towards higher resistance levels. The previous resistance at $104,800 now acts as a strong support, indicating a potential retest before further upside or a direct continuation of the uptrend.',
        riskLevel: 'medium',
        timeframe: timeframe || '4H',
        riskRewardRatio: 1.72,
        keyLevels: {
          support: ['106,800', '104,800', '96,000'],
          resistance: ['110,800', '112,000', '113,000']
        },
        volumeAnalysis: 'The initial strong upward move from the $96,000 low was accompanied by heavy buying volume, confirming the breakout\'s strength. The subsequent consolidation phase occurred on relatively lower volume, which is constructive for a bullish continuation. The latest upward push visible in the current candle is also showing healthy volume, suggesting sustained buyer interest.',
        technicalIndicators: [
          'RSI: 65 (neutral to bullish momentum)',
          'MACD: Bullish crossover with increasing histogram',
          'Moving Averages: Price above 50MA and 200MA',
          'Volume: Increasing on upward moves'
        ],
        recommendations: [
          'Wait for confirmation above $109,000 resistance with volume',
          'Set stop loss at $106,800 for risk management',
          'Target $112,800 for profit taking',
          'Monitor volume for sustained buying pressure'
        ],
        cryptoContext: 'The broader cryptocurrency market exhibits strong positive sentiment, highlighted by Bitcoin spot ETFs experiencing significant net inflows (approximately 15,000 BTC or $1.6 billion) for the third consecutive week. This robust institutional demand, despite some outflows from specific funds, provides a strong fundamental tailwind for Bitcoin\'s price. Bitcoin\'s market capitalization stands at $2.17T, underscoring its dominant position and market health.',
        riskFactors: [
          'High market volatility inherent to cryptocurrencies, potentially leading to rapid price swings',
          'Potential for unexpected bearish news or adverse regulatory developments',
          'Risk of a false breakout from the consolidation if buying volume does not sustain at higher levels',
          'Influence of global macroeconomic factors on risk-on assets like Bitcoin'
        ],
        positionSizing: 'Allocate 1-2% of total trading capital per trade. Strict adherence to the recommended stop loss is crucial for effective risk management.'
      };

        // Save analysis to database if user is authenticated
        if (userId) {
          await prisma.chartAnalysis.create({
            data: {
              userId: userId as string,
              symbol: symbol || 'Unknown',
              timeframe: timeframe || 'Unknown',
              imageUrl: savedImageUrl,
              analysis: (mockAnalysis as unknown) as Prisma.InputJsonValue,
              creditsUsed: 1,
            },
          });

          // Deduct credits
          await prisma.user.update({
            where: { id: userId as string },
            data: { 
              credits: { 
                decrement: 1 
              } 
            }
          });

          // Record credit transaction
          await prisma.creditTransaction.create({
            data: {
              userId: userId as string,
              amount: -1,
              type: 'used',
              description: 'Chart analysis'
            }
          });
        }

        return NextResponse.json({
          success: true,
          analysis: mockAnalysis,
          timestamp: new Date().toISOString(),
          note: 'Mock data returned - configure GEMINI_API_KEY for real Gemini 2.5 Flash analysis'
        });
    }

    // Validate API key
    const isApiKeyValid = await geminiService.validateApiKey();
    if (!isApiKeyValid) {
        return NextResponse.json({
          error: 'Gemini 2.5 Flash API key not configured or invalid',
          details: 'Please configure GEMINI_API_KEY in your environment variables'
        }, { status: 500 });
    }

    // Analyze chart using AI
    let analysis: any;
    try {
      analysis = await geminiService.analyzeChart({
        imageBase64,
        symbol,
        timeframe,
        additionalContext,
      });
    } catch (aiErr: any) {
      // Graceful fallback on overload or timeout
      const message = String(aiErr?.message || '');
      const lower = message.toLowerCase();
      const isOverloaded = message.includes('503') || lower.includes('overloaded') || lower.includes('quota') || lower.includes('rate');
      const isTimeout = lower.includes('timeout');
      if (isOverloaded || isTimeout) {
        console.warn('Gemini overloaded, using mock analysis fallback and continuing to save.');
        analysis = {
          symbol: symbol || 'BTC/USDT',
          pattern: 'Bullish Consolidation / Potential Bullish Flag Breakout',
          trend: 'bullish',
          entryPrice: '109.000',
          targetPrice: '112.800',
          stopLoss: '106.800',
          confidence: 85,
          analysis: 'BTC/USDT on the 4-hour chart has demonstrated strong bullish momentum, breaking above a key resistance level around $104,800 with significant volume. Following this breakout, the price consolidated around the $107,000-$109,000 range, potentially forming a bullish flag or pennant pattern. The current candle shows renewed buying pressure, suggesting a potential breakout continuation towards higher resistance levels.',
          riskLevel: 'medium',
          timeframe: timeframe || '4H',
          riskRewardRatio: 1.72,
          keyLevels: { 
            support: ['106,800', '104,800', '96,000'], 
            resistance: ['110,800', '112,000', '113,000'] 
          },
          volumeAnalysis: 'The initial strong upward move was accompanied by heavy buying volume, confirming the breakout\'s strength. The subsequent consolidation phase occurred on relatively lower volume, which is constructive for a bullish continuation.',
          technicalIndicators: [
            'RSI: 65 (neutral to bullish momentum)',
            'MACD: Bullish crossover with increasing histogram',
            'Moving Averages: Price above 50MA and 200MA',
            'Volume: Increasing on upward moves'
          ],
          recommendations: [
            'Wait for confirmation above resistance with volume',
            'Set stop loss for risk management',
            'Target higher levels for profit taking',
            'Monitor volume for sustained buying pressure'
          ],
          cryptoContext: 'The broader cryptocurrency market exhibits strong positive sentiment with institutional demand providing fundamental support.',
          riskFactors: [
            'High market volatility inherent to cryptocurrencies',
            'Potential for unexpected bearish news or adverse regulatory developments',
            'Risk of false breakout if volume doesn\'t sustain',
            'Influence of global macroeconomic factors'
          ],
          positionSizing: 'Allocate 1-2% of total trading capital per trade. Strict adherence to stop loss is crucial for risk management.',
          note: '⚠️ Gemini 2.5 Flash unavailable (overload/timeout). Fallback analysis used.',
        };
      } else {
        throw aiErr;
      }
    }

    // Persist analysis and update credits if authenticated (atomic)
    if (userId) {
      await prisma.$transaction(async (tx) => {
        // Ensure the user still has credits inside the transaction
        const u = await tx.user.findUnique({ where: { id: userId as string }, select: { credits: true } });
        if (!u || u.credits < 1) {
          throw new Error('Insufficient credits');
        }

        await tx.chartAnalysis.create({
          data: {
            userId: userId as string,
            symbol: symbol || 'Unknown',
            timeframe: timeframe || 'Unknown',
            imageUrl: savedImageUrl,
            analysis: (analysis as unknown) as Prisma.InputJsonValue,
            creditsUsed: 1,
          },
        });

        await tx.user.update({
          where: { id: userId as string },
          data: { credits: { decrement: 1 } },
        });

        await tx.creditTransaction.create({
          data: {
            userId: userId as string,
            amount: -1,
            type: 'used',
            description: 'Chart analysis',
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chart analysis error:', error);
    
    if (error instanceof Error) {
        if (error.message.includes('Gemini API key')) {
          return NextResponse.json({
            error: 'API key configuration error',
            details: error.message
          }, { status: 500 });
        }

        if (error.message.includes('Gemini API error')) {
          return NextResponse.json({
            error: 'Gemini 2.5 Flash API error',
            details: error.message
          }, { status: 500 });
        }
    }

    return NextResponse.json({ 
      error: 'Failed to analyze chart',
      details: 'An unexpected error occurred during analysis'
    }, { status: 500 });
  }
}

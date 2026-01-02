import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/geminiService';
import { prisma } from '@/lib/database';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

    // For Vercel: Store image as base64 data URL (works in serverless environment)
    const savedImageUrl = `data:${fileType || 'image/png'};base64,${imageBase64}`;

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('No Gemini API key configured');
      return NextResponse.json({
        error: 'AI unavailable. Please configure GEMINI_API_KEY to enable chart analysis.'
      }, { status: 500 });
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
    let marketData: any = null;
    try {
      // Fetch real-time market data
      if (userId && symbol) {
        const { nodeService } = await import('@/lib/nodeService');
        marketData = await nodeService.getMarketData(userId, symbol);
      }

      if (!marketData && symbol) {
        const { fetchMarketData } = await import('@/lib/marketData');
        marketData = await fetchMarketData(symbol);
      }

      analysis = await geminiService.analyzeChart({
        imageBase64,
        symbol,
        timeframe,
        additionalContext,
      }, marketData);
    } catch (aiError) {
      console.error('AI Analysis failed:', aiError);
      throw aiError;
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
            analysis: analysis as any,
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
      }, {
        timeout: 60000 // Increase timeout to 60 seconds for maximum reliability with large image data
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      marketData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chart analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze chart';

    // Handle specifically known error types
    if (errorMessage.startsWith('NOT_CHART:')) {
      return NextResponse.json({
        error: 'Invalid image. Please upload a trading chart image (candlestick/line chart).',
        details: errorMessage.replace('NOT_CHART: ', '')
      }, { status: 400 });
    }

    if (errorMessage.includes('Insufficient credits')) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Analysis Failed',
      details: errorMessage || 'An unexpected error occurred during analysis'
    }, { status: 500 });
  }
}

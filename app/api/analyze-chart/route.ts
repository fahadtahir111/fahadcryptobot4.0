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
    try {
      analysis = await geminiService.analyzeChart({
        imageBase64,
        symbol,
        timeframe,
        additionalContext,
      });
    } catch (aiError) {
      // Re-throw the error to be handled by the outer catch block
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
        // Handle non-chart image error
        if (error.message.startsWith('NOT_CHART:')) {
          return NextResponse.json({
            error: 'Invalid image. Please upload a trading chart image (candlestick/line chart).',
            details: 'The uploaded image is not a trading chart. Please upload a candlestick or line chart for analysis.'
          }, { status: 400 });
        }

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

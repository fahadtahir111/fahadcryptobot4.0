import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const signals = await prisma.signal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        trades: true,
      },
    });

    return NextResponse.json({ signals });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, type, entryPrice, targetPrice, stopLoss, confidence, analysis, userId } = body;

    if (!symbol || !type || !entryPrice || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const signal = await prisma.signal.create({
      data: {
        symbol,
        type,
        entryPrice: parseFloat(entryPrice),
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        confidence: parseFloat(confidence),
        analysis,
        userId,
      },
    });

    return NextResponse.json({ signal }, { status: 201 });
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 });
  }
}

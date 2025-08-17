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

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        signal: true,
      },
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signalId, symbol, type, entryPrice, quantity, userId } = body;

    if (!signalId || !symbol || !type || !entryPrice || !quantity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const trade = await prisma.trade.create({
      data: {
        signalId,
        symbol,
        type,
        entryPrice: parseFloat(entryPrice),
        quantity: parseFloat(quantity),
        userId,
      },
    });

    // Update signal status to active
    await prisma.signal.update({
      where: { id: signalId },
      data: { status: 'active' },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, exitPrice, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (exitPrice !== undefined) updateData.exitPrice = parseFloat(exitPrice);
    if (status !== undefined) updateData.status = status;
    if (status === 'closed') updateData.closedAt = new Date();

    const trade = await prisma.trade.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ trade });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate total portfolio value
    const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * item.buyPrice), 0);

    return NextResponse.json({ 
      portfolio, 
      totalValue
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, amount, buyPrice, notes, userId } = body;

    if (!symbol || !amount || !buyPrice || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.upsert({
      where: { 
        userId_symbol: { 
          userId, 
          symbol 
        } 
      },
      update: {
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
        notes: notes || null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        symbol,
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
        notes: notes || null,
      },
    });

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

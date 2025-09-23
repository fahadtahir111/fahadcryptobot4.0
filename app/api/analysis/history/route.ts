import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const history = await prisma.chartAnalysis.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        symbol: true,
        timeframe: true,
        imageUrl: true,
        analysis: true,
        creditsUsed: true,
        createdAt: true,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

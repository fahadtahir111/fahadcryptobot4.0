import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('auth')?.value || '';
    const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
    const decoded = jwt.verify(String(token || ''), secret) as any;
    const { id } = await params;

    const analysis = await prisma.chartAnalysis.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
      select: {
        id: true,
        userId: true,
        symbol: true,
        timeframe: true,
        imageUrl: true,
        analysis: true,
        creditsUsed: true,
        createdAt: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('auth')?.value || '';
    const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
    const decoded = jwt.verify(String(token || ''), secret) as any;
    const { id } = await params;

    // Check if analysis belongs to user
    const analysis = await prisma.chartAnalysis.findFirst({
      where: { 
        id: id,
        userId: decoded.userId 
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Delete the analysis
    await prisma.chartAnalysis.delete({
      where: { id: id },
    });

    // Refund credits
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { credits: { increment: analysis.creditsUsed } }
    });

    // Record credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: decoded.userId,
        amount: analysis.creditsUsed,
        type: 'refund',
        description: 'Analysis deleted'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete analysis error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

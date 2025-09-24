import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
    const decoded = jwt.verify(String(token || ''), secret) as any;

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, amount, description } = await req.json();

    if (!userId || !amount || amount === 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Record credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type: amount > 0 ? 'admin_added' : 'admin_removed',
        description: description || `Admin ${amount > 0 ? 'added' : 'removed'} ${Math.abs(amount)} credits`
      }
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: decoded.userId,
        action: 'credits_modified',
        targetId: userId,
        details: { amount, description }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin credits update error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

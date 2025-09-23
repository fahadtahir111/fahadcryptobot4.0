import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getIO } from '@/lib/serverSockets';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth')?.value;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearer || cookieToken;
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));
    const skip = (page - 1) * pageSize;

    const [total, transactions] = await Promise.all([
      prisma.creditTransaction.count(),
      prisma.creditTransaction.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({ transactions, total, page, pageSize });
  } catch (error) {
    console.error('Admin transactions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

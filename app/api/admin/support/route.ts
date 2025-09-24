import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth')?.value;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearer || cookieToken;
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
    const decoded = jwt.verify(String(token || ''), secret) as any;

    const me = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { isAdmin: true } });
    if (!me?.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 50)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (userId) where.userId = userId;

    const [total, messages] = await Promise.all([
      prisma.chatMessage.count({ where }),
      prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          message: true,
          isAdmin: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        }
      })
    ]);

    return NextResponse.json({ messages, total, page, pageSize });
  } catch (error) {
    console.error('Admin support fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch support messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth')?.value;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearer || cookieToken;
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    const secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
    const decoded = jwt.verify(String(token || ''), secret) as any;

    const me = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { isAdmin: true } });
    if (!me?.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { userId, message } = await req.json();
    if (!userId || !message) {
      return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
    }

    // Create support message
    const supportMessage = await prisma.chatMessage.create({
      data: {
        userId,
        message,
        isAdmin: true,
      },
      select: {
        id: true,
        userId: true,
        message: true,
        isAdmin: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      }
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: decoded.userId,
        action: 'support_reply',
        targetId: userId,
        details: { message },
      },
    });

    return NextResponse.json(supportMessage);
  } catch (error) {
    console.error('Admin support reply error:', error);
    return NextResponse.json({ error: 'Failed to send support reply' }, { status: 500 });
  }
}



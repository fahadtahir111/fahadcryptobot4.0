import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getIO } from '@/lib/serverSockets';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function unauthorized() {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}

function getAdminIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('auth')?.value;
  const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = bearer || cookieToken || null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

async function ensureAdmin(userId: string | null) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  return !!user?.isAdmin;
}

export async function GET(req: NextRequest) {
  try {
    const adminId = getAdminIdFromRequest(req);
    const isAdmin = await ensureAdmin(adminId);
    if (!isAdmin) return unauthorized();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          isAdmin: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ users, page, pageSize, total });
  } catch (err) {
    console.error('Admin users list error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = getAdminIdFromRequest(req);
    const isAdmin = await ensureAdmin(adminId);
    if (!isAdmin) return unauthorized();

    const { email, name, password, credits, isAdmin: makeAdmin } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        credits: credits || 3,
        isAdmin: makeAdmin || false,
        isActive: true,
      },
      select: { id: true, email: true, name: true, credits: true, isAdmin: true, isActive: true, createdAt: true },
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: adminId!,
        action: 'user_created',
        targetId: newUser.id,
        details: { email, name, credits, isAdmin: makeAdmin },
      },
    });

    // Emit realtime updates
    try {
      const io = getIO();
      if (io) {
        io.emit('admin:user-created', newUser);
      }
    } catch {}

    return NextResponse.json(newUser);
  } catch (err) {
    console.error('Admin user creation error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminId = getAdminIdFromRequest(req);
    const isAdmin = await ensureAdmin(adminId);
    if (!isAdmin) return unauthorized();

    const { id, email, name, credits, isAdmin: makeAdmin, isActive } = await req.json();
    if (!id || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: { email, id: { not: id } }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already taken by another user' }, { status: 400 });
    }

    const updates: any = { email, name, credits, isAdmin: makeAdmin, isActive };
    
    const updated = await prisma.user.update({
      where: { id },
      data: updates,
      select: { id: true, email: true, name: true, credits: true, isAdmin: true, isActive: true, createdAt: true },
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: adminId!,
        action: 'user_updated',
        targetId: id,
        details: { email, name, credits, isAdmin: makeAdmin, isActive },
      },
    });

    // Emit realtime updates
    try {
      const io = getIO();
      if (io) {
        io.emit('admin:user-updated', updated);
      }
    } catch {}

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Admin user update error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminId = getAdminIdFromRequest(req);
    const isAdmin = await ensureAdmin(adminId);
    if (!isAdmin) return unauthorized();

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({ where: { id: userId } });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: adminId!,
        action: 'user_deleted',
        targetId: userId,
        details: { email: userToDelete.email, name: userToDelete.name },
      },
    });

    // Emit realtime updates
    try {
      const io = getIO();
      if (io) {
        io.emit('admin:user-deleted', { id: userId });
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin user deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = getAdminIdFromRequest(req);
    const isAdmin = await ensureAdmin(adminId);
    if (!isAdmin) return unauthorized();

    const { userId, isActive, isAdmin: makeAdmin, creditsDelta } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const updates: any = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (typeof makeAdmin === 'boolean') updates.isAdmin = makeAdmin;
    if (typeof creditsDelta === 'number' && creditsDelta !== 0) {
      updates.credits = { increment: creditsDelta };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, email: true, name: true, credits: true, isAdmin: true, isActive: true, createdAt: true },
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: adminId!,
        action: 'user_updated',
        targetId: userId,
        details: { isActive, isAdmin: makeAdmin, creditsDelta },
      },
    });

    // Credit transactions
    if (typeof creditsDelta === 'number' && creditsDelta !== 0) {
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: creditsDelta,
          type: creditsDelta > 0 ? 'admin_added' : 'admin_removed',
          description: 'Admin user update',
        },
      });
    }

    // Emit realtime updates
    try {
      const io = getIO();
      if (io) {
        io.emit('admin:user-updated', updated);
      }
    } catch {}

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Admin user update error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

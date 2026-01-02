import { NextRequest, NextResponse } from 'next/server';
import { nodeService } from '@/lib/nodeService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const cookieToken = req.cookies.get('auth')?.value;
    if (!cookieToken) return null;

    try {
        const decoded = jwt.verify(cookieToken, JWT_SECRET) as any;
        return decoded.userId;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

export async function GET(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const nodes = await nodeService.getUserNodes(userId);
        return NextResponse.json({ nodes });
    } catch (error) {
        console.error('Fetch nodes failed:', error);
        return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, url, type } = body;

        if (!name || !url || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const node = await nodeService.addNode(userId, { name, url, type });
        return NextResponse.json({ node });
    } catch (error) {
        console.error('Add node failed:', error);
        return NextResponse.json({ error: 'Failed to add node' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'Node ID missing' }, { status: 400 });

        const node = await nodeService.getUserNodes(userId);
        const targetNode = node.find((n: any) => n.id === id);

        if (!targetNode) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

        const status = await nodeService.testNode(targetNode.url, targetNode.type);

        // Update status in DB (Implementation skipped in NodeService but we can use prisma directly or add to service)
        const { prisma } = await import('@/lib/database');
        const updated = await (prisma as any).tradingNode.update({
            where: { id },
            data: {
                status: status.status,
                latency: status.latency,
                lastCheck: new Date(),
            }
        });

        return NextResponse.json({ node: updated });
    } catch (error) {
        console.error('Test node failed:', error);
        return NextResponse.json({ error: 'Failed to test node' }, { status: 500 });
    }
}

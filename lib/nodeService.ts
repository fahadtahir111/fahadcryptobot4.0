import { prisma } from './database';

export interface NodeStatus {
    url: string;
    status: 'online' | 'offline' | 'unknown';
    latency?: number;
}

export class NodeService {
    private static instance: NodeService;

    private constructor() { }

    public static getInstance(): NodeService {
        if (!NodeService.instance) {
            NodeService.instance = new NodeService();
        }
        return NodeService.instance;
    }

    public async testNode(url: string, type: string): Promise<NodeStatus> {
        const startTime = Date.now();
        try {
            if (type === 'solana') {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getHealth',
                    }),
                });

                const data = await response.json();
                if (data.result === 'ok') {
                    return {
                        url,
                        status: 'online',
                        latency: Date.now() - startTime,
                    };
                }
            } else {
                // Generic JSON-RPC test (e.g. Ethereum)
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'eth_blockNumber',
                    }),
                });

                if (response.ok) {
                    return {
                        url,
                        status: 'online',
                        latency: Date.now() - startTime,
                    };
                }
            }

            return { url, status: 'offline' };
        } catch (error) {
            console.error(`Node test failed for ${url}:`, error);
            return { url, status: 'offline' };
        }
    }

    public async getUserNodes(userId: string) {
        return await (prisma as any).tradingNode.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    public async addNode(userId: string, data: { name: string; url: string; type: string }) {
        const testResult = await this.testNode(data.url, data.type);

        return await (prisma as any).tradingNode.upsert({
            where: {
                userId_url: {
                    userId,
                    url: data.url,
                },
            },
            update: {
                name: data.name,
                type: data.type,
                status: testResult.status,
                latency: testResult.latency,
                lastCheck: new Date(),
            },
            create: {
                userId,
                name: data.name,
                url: data.url,
                type: data.type,
                status: testResult.status,
                latency: testResult.latency,
            },
        });
    }

    public async getMarketData(userId: string, symbol: string): Promise<any | null> {
        const nodes = await this.getUserNodes(userId);
        const onlineNodes = nodes.filter((n: any) => n.status === 'online');

        if (onlineNodes.length === 0) return null;

        const bestNode = onlineNodes.sort((a: any, b: any) => (a.latency || 9999) - (b.latency || 9999))[0];

        try {
            const lastBlock = await this.getLatestBlock(bestNode.url, bestNode.type);
            return {
                source: `User RPC (${bestNode.type})`,
                nodeName: bestNode.name,
                latency: bestNode.latency,
                onChainStatus: 'connected',
                lastBlock,
                fetchTime: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to fetch data from node:', error);
            return null;
        }
    }

    private async getLatestBlock(url: string, type: string): Promise<number | null> {
        try {
            const method = type === 'solana' ? 'getSlot' : 'eth_blockNumber';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method }),
            });
            const data = await response.json();
            return type === 'solana' ? data.result : parseInt(data.result, 16);
        } catch {
            return null;
        }
    }
}

export const nodeService = NodeService.getInstance();

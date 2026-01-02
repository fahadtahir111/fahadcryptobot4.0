'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Server,
    Activity,
    Plus,
    RefreshCw,
    CheckCircle,
    XCircle,
    Zap,
    Globe,
    Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingNode {
    id: string;
    name: string;
    url: string;
    type: string;
    status: string;
    latency?: number;
    lastCheck: string;
}

export function TradingNodes() {
    const [nodes, setNodes] = useState<TradingNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newNode, setNewNode] = useState({ name: '', url: '', type: 'solana' });
    const { toast } = useToast();

    useEffect(() => {
        fetchNodes();
    }, []);

    const fetchNodes = async () => {
        try {
            const response = await fetch('/api/nodes');
            const data = await response.json();
            if (data.nodes) setNodes(data.nodes);
        } catch (error) {
            console.error('Error fetching nodes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addNode = async () => {
        if (!newNode.name || !newNode.url) return;
        setIsAdding(true);
        try {
            const response = await fetch('/api/nodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNode),
            });
            const data = await response.json();
            if (data.node) {
                setNodes([data.node, ...nodes]);
                setNewNode({ name: '', url: '', type: 'solana' });
                toast({
                    title: "Node Added",
                    description: `${newNode.name} has been added successfully.`,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add node. Please check the URL.",
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    const testNode = async (id: string) => {
        try {
            const response = await fetch('/api/nodes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.node) {
                setNodes(nodes.map(n => n.id === id ? data.node : n));
                toast({
                    title: "Connection Test",
                    description: `Node ${data.node.name} is ${data.node.status} (${data.node.latency}ms).`,
                });
            }
        } catch (error) {
            toast({
                title: "Test Failed",
                description: "Could not connect to the node.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold professional-heading">Trading Market Nodes</h2>
                    <p className="text-gray-400 text-sm">Configure high-speed RPC nodes for market analysis and trading.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchNodes} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Add Node Form */}
                <Card className="clean-card md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Node
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Node Name</label>
                            <Input
                                placeholder="e.g. My Solana Node"
                                value={newNode.name}
                                onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">RPC URL</label>
                            <Input
                                placeholder="https://mainnet.helius-rpc.com/?api-key=..."
                                value={newNode.url}
                                onChange={(e) => setNewNode({ ...newNode, url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Market Type</label>
                            <select
                                className="w-full bg-background border rounded-md p-2 text-sm outline-none"
                                value={newNode.type}
                                onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
                            >
                                <option value="solana">Solana</option>
                                <option value="ethereum">Ethereum (EVM)</option>
                                <option value="base">Base</option>
                                <option value="bsc">BSC</option>
                            </select>
                        </div>
                        <Button className="w-full professional-button" onClick={addNode} disabled={isAdding}>
                            {isAdding ? "Testing Connection..." : "Add Trading Node"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Nodes List */}
                <div className="md:col-span-2 space-y-4">
                    {nodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/5">
                            <Server className="w-12 h-12 text-gray-600 mb-4" />
                            <p className="text-gray-500">No trading nodes configured yet.</p>
                        </div>
                    ) : (
                        nodes.map(node => (
                            <Card key={node.id} className="clean-card hover-glow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${node.status === 'online' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                {node.type === 'solana' ? <Zap className="w-5 h-5 text-purple-500" /> : <Globe className="w-5 h-5 text-blue-500" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{node.name}</h3>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{node.url}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <Badge variant={node.status === 'online' ? 'default' : 'destructive'} className="mb-1 uppercase text-[10px]">
                                                    {node.status}
                                                </Badge>
                                                {node.latency && (
                                                    <p className="text-[10px] text-gray-400 font-mono">{node.latency}ms latency</p>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => testNode(node.id)}>
                                                <Activity className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

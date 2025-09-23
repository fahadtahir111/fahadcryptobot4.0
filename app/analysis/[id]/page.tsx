"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, TrendingUp } from 'lucide-react';

interface AnalysisDetail {
	id: string;
	userId: string;
	symbol: string | null;
	timeframe: string | null;
	imageUrl: string | null;
	analysis: any;
	creditsUsed: number;
	createdAt: string;
}

export default function AnalysisDetailPage() {
	const { user } = useAuth();
  const params = useParams();
  const id = (params as any)?.id as string | undefined;
	const [data, setData] = useState<AnalysisDetail | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchItem = async () => {
			try {
				if (!id) { return; }
				const res = await fetch(`/api/analysis/${id}`);
				if (!res.ok) {
					setError('Failed to load analysis');
					return;
				}
				const json = await res.json();
				setData(json);
			} catch (e) {
				setError('Network error');
			} finally {
				setLoading(false);
			}
		};
		fetchItem();
	}, [id]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-6">
				<p className="text-gray-400">Loading...</p>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="container mx-auto px-4 py-6">
				<p className="text-red-400">{error || 'Not found'}</p>
			</div>
		);
	}

	const a = data.analysis || {};

	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<Button variant="ghost" onClick={() => history.back()} className="text-white hover:text-white hover:bg-white/10">
				<ArrowLeft className="w-4 h-4 mr-2" /> Back
			</Button>
			<Card className="clean-card">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span className="flex items-center space-x-2">
							<TrendingUp className="w-5 h-5 text-blue-400" />
							<span>{data.symbol || 'Unknown'}</span>
						</span>
						<div className="flex items-center space-x-2">
							{data.timeframe && <Badge variant="outline">{data.timeframe}</Badge>}
							<Badge variant="secondary">{data.creditsUsed} credit{data.creditsUsed > 1 ? 's' : ''}</Badge>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{data.imageUrl && (
						<img src={data.imageUrl} alt={String(data.symbol)} className="w-full max-h-[420px] object-contain rounded-lg border border-white/10" />
					)}

					<div className="grid md:grid-cols-2 gap-6">
						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg">Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="font-medium">Symbol:</span>
									<span className="text-white">{String(a.symbol || data.symbol || 'Unknown')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Pattern:</span>
									<span className="text-white">{String(a.pattern || 'Unknown')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Trend:</span>
									<Badge className={`${a.trend === 'bullish' ? 'bg-green-500' : a.trend === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
										{String(a.trend || 'neutral')}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Timeframe:</span>
									<span className="text-white">{String(a.timeframe || data.timeframe || 'Unknown')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Confidence:</span>
									<span className="text-white">{Number(a.confidence || 0)}%</span>
								</div>
							</CardContent>
						</Card>
						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg">Price Levels</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="font-medium">Entry Price:</span>
									<span className="text-green-400 font-semibold">${String(a.entryPrice || 'N/A')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Target Price:</span>
									<span className="text-blue-400 font-semibold">${String(a.targetPrice || 'N/A')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Stop Loss:</span>
									<span className="text-red-400 font-semibold">${String(a.stopLoss || 'N/A')}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Risk/Reward:</span>
									<span className="text-white">{Number(a.riskRewardRatio || 0).toFixed(2)}:1</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Risk Level:</span>
									<Badge className={`${a.riskLevel === 'low' ? 'bg-green-500' : a.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
										{String(a.riskLevel || 'medium')}
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg">Key Levels</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h4 className="text-green-400 font-semibold mb-2">Support Levels</h4>
									<div className="space-y-1">
										{Array.isArray(a.keyLevels?.support) ? a.keyLevels.support.map((level: any, i: number) => (
											<div key={i} className="text-green-400 text-sm">• {String(level)}</div>
										)) : <div className="text-sm text-gray-400">No support levels</div>}
									</div>
								</div>
								<div>
									<h4 className="text-red-400 font-semibold mb-2">Resistance Levels</h4>
									<div className="space-y-1">
										{Array.isArray(a.keyLevels?.resistance) ? a.keyLevels.resistance.map((level: any, i: number) => (
											<div key={i} className="text-red-400 text-sm">• {String(level)}</div>
										)) : <div className="text-sm text-gray-400">No resistance levels</div>}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg">Technical Analysis</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h4 className="text-white font-semibold mb-2">Analysis</h4>
									<p className="text-gray-300 text-sm leading-relaxed">
										{String(a.analysis || 'Technical analysis not available')}
									</p>
								</div>
								<div>
									<h4 className="text-white font-semibold mb-2">Volume Analysis</h4>
									<p className="text-gray-300 text-sm leading-relaxed">
										{String(a.volumeAnalysis || 'Volume analysis not available')}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="clean-card">
						<CardHeader>
							<CardTitle className="text-lg">Technical Indicators</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-3">
								{Array.isArray(a.technicalIndicators) ? a.technicalIndicators.map((indicator: any, i: number) => (
									<div key={i} className="p-3 bg-white/5 rounded-lg text-sm border border-white/10">
										{String(indicator)}
									</div>
								)) : <div className="text-sm text-gray-400">No technical indicators available</div>}
							</div>
						</CardContent>
					</Card>

					<Card className="clean-card">
						<CardHeader>
							<CardTitle className="text-lg">Crypto Market Context</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-300 leading-relaxed">
								{String(a.cryptoContext || 'Market context not available')}
							</p>
						</CardContent>
					</Card>

					<div className="grid md:grid-cols-2 gap-6">
						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg text-green-400">Risk Factors</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{Array.isArray(a.riskFactors) ? a.riskFactors.map((risk: any, i: number) => (
									<div key={i} className="text-sm text-gray-300">• {String(risk)}</div>
								)) : <div className="text-sm text-gray-400">No risk factors identified</div>}
							</CardContent>
						</Card>

						<Card className="clean-card">
							<CardHeader>
								<CardTitle className="text-lg text-blue-400">Position Sizing</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-300 text-sm leading-relaxed">
									{String(a.positionSizing || 'Position sizing guidance not available')}
								</p>
							</CardContent>
						</Card>
					</div>

					<Card className="clean-card">
						<CardHeader>
							<CardTitle className="text-lg">Recommendations</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{Array.isArray(a.recommendations) ? a.recommendations.map((r: any, i: number) => (
								<div key={i} className="p-3 bg-blue-500/10 rounded-lg text-sm border border-blue-500/20">
									{String(r)}
								</div>
							)) : <div className="text-sm text-gray-400">No recommendations available</div>}
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</div>
	);
}

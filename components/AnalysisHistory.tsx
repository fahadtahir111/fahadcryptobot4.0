'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Clock,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisHistoryItem {
  id: string;
  symbol: string;
  timeframe: string;
  imageUrl?: string;
  analysis: any;
  creditsUsed: number;
  createdAt: string;
}

export function AnalysisHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
      // Listen for new analyses to refresh in real-time
      const handler = () => fetchHistory();
      if (typeof window !== 'undefined') {
        window.addEventListener('analysis:created', handler);
      }
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('analysis:created', handler);
        }
      };
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/analysis/history', { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        setError('Failed to fetch analysis history');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        setError('Failed to delete analysis');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  if (loading) {
    return (
      <Card className="clean-card">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white professional-heading">
            <div className="w-8 h-8 mr-4 bg-white rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-black" />
            </div>
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="clean-card">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white professional-heading">
          <div className="w-8 h-8 mr-4 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          Analysis History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400 professional-text">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No analysis history found</p>
            <p className="text-sm">Your chart analyses will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <a href={`/analysis/${item.id}`} key={item.id} className="block p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.symbol}
                        className="w-10 h-10 rounded-md border border-white/10 object-cover"
                      />
                    )}
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{item.symbol}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.timeframe}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.creditsUsed} credit{item.creditsUsed > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); deleteAnalysis(item.id); }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Pattern:</span>
                    <span className="text-white">{item.analysis.pattern || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Trend:</span>
                    <span className={getTrendColor(item.analysis.trend)}>
                      {item.analysis.trend || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <p className="line-clamp-2">
                    {item.analysis.analysis || 'No analysis details available'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

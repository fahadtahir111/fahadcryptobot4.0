'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Image, 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle as TriangleAlert,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { ChartAnalysisResponse } from '@/lib/gpt5Service';

export function ChartUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ChartAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('File size too large. Please select an image under 10MB.');
          return;
        }
        setSelectedFile(file);
        setError(null);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file (PNG, JPG, JPEG)');
      }
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop an image file (PNG, JPG, JPEG)');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const analyzeChart = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(selectedFile);
      
      // Call GPT-5 API
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          symbol: symbol || undefined,
          timeframe: timeframe || undefined,
          additionalContext: additionalContext || undefined,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Non-JSON response received:', errorText);
        throw new Error('Server returned an invalid response. Please check the console for details.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to analyze chart');
      }

      if (!data.analysis) {
        throw new Error('No analysis data received from server');
      }

      // Ensure all values are properly formatted before setting state
      const sanitizedAnalysis = {
        ...data.analysis,
        symbol: (() => {
          const value = data.analysis.symbol;
          if (typeof value === 'object') {
            console.log('API returned object for symbol:', value);
            return JSON.stringify(value) || 'Unknown';
          }
          return String(value || 'Unknown');
        })(),
        pattern: (() => {
          const value = data.analysis.pattern;
          if (typeof value === 'object') {
            console.log('API returned object for pattern:', value);
            return JSON.stringify(value) || 'Unknown';
          }
          return String(value || 'Unknown');
        })(),
        trend: data.analysis.trend || 'neutral',
        entryPrice: (() => {
          const value = data.analysis.entryPrice;
          if (typeof value === 'object') {
            console.log('API returned object for entryPrice:', value);
            return JSON.stringify(value) || 'N/A';
          }
          return String(value || 'N/A');
        })(),
        targetPrice: (() => {
          const value = data.analysis.targetPrice;
          if (typeof value === 'object') {
            console.log('API returned object for targetPrice:', value);
            return JSON.stringify(value) || 'N/A';
          }
          return String(value || 'N/A');
        })(),
        stopLoss: (() => {
          const value = data.analysis.stopLoss;
          if (typeof value === 'object') {
            console.log('API returned object for stopLoss:', value);
            return JSON.stringify(value) || 'N/A';
          }
          return String(value || 'N/A');
        })(),
        confidence: Number(data.analysis.confidence) || 0,
        analysis: (() => {
          const value = data.analysis.analysis;
          if (typeof value === 'object') {
            console.log('API returned object for analysis:', value);
            return JSON.stringify(value) || 'Analysis not available';
          }
          return String(value || 'Analysis not available');
        })(),
        riskLevel: data.analysis.riskLevel || 'medium',
        timeframe: (() => {
          const value = data.analysis.timeframe;
          if (typeof value === 'object') {
            console.log('API returned object for timeframe:', value);
            return JSON.stringify(value) || 'Unknown';
          }
          return String(value || 'Unknown');
        })(),
        riskRewardRatio: Number(data.analysis.riskRewardRatio) || 1.0,
        keyLevels: data.analysis.keyLevels || { support: [], resistance: [] },
        volumeAnalysis: (() => {
          const value = data.analysis.volumeAnalysis;
          if (typeof value === 'object') {
            console.log('API returned object for volumeAnalysis:', value);
            return JSON.stringify(value) || 'Volume analysis not available';
          }
          return String(value || 'Volume analysis not available');
        })(),
        technicalIndicators: Array.isArray(data.analysis.technicalIndicators) ? data.analysis.technicalIndicators.map(String) : [],
        recommendations: Array.isArray(data.analysis.recommendations) ? data.analysis.recommendations.map(String) : [],
        cryptoContext: (() => {
          const value = data.analysis.cryptoContext;
          if (typeof value === 'object') {
            console.log('API returned object for cryptoContext:', value);
            return JSON.stringify(value) || 'Market context not available';
          }
          return String(value || 'Market context not available');
        })(),
        riskFactors: Array.isArray(data.analysis.riskFactors) ? data.analysis.riskFactors.map(String) : [],
        positionSizing: (() => {
          const value = data.analysis.positionSizing;
          if (typeof value === 'object') {
            console.log('API returned object for positionSizing:', value);
            return JSON.stringify(value) || 'Position sizing not available';
          }
          return String(value || 'Position sizing not available');
        })()
      };

      console.log('Original analysis data:', data.analysis);
      console.log('Sanitized analysis data:', sanitizedAnalysis);

      setAnalysis(sanitizedAnalysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze chart. Please try again.';
      setError(errorMessage);
      console.error('Chart analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    setSymbol('');
    setTimeframe('');
    setAdditionalContext('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Utility function to safely render any value
  const safeRender = (value: any, fallback: string = 'N/A'): string => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'object') {
      console.log('Attempting to render object:', value);
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value) || fallback;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Chart Analysis</h2>
        <p className="text-muted-foreground">
          Upload your trading chart and get AI-powered analysis using GPT-5
        </p>
      </div>

      {!analysis ? (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Chart Image
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Settings Panel */}
              {showSettings && (
                <div className="p-4 rounded-lg bg-muted/30 border space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="symbol">Symbol (Optional)</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., BTC/USDT"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeframe">Timeframe (Optional)</Label>
                      <Input
                        id="timeframe"
                        placeholder="e.g., 4H, 1D"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Any additional information about the chart or market conditions..."
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFile 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img 
                      src={preview} 
                      alt="Chart preview" 
                      className="max-w-full max-h-64 mx-auto rounded-lg border"
                    />
                    <div className="flex items-center justify-center space-x-2">
                      <Image className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium mb-2">
                        Drop your chart image here
                      </p>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PNG, JPG, JPEG (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  Choose File
                </Button>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <TriangleAlert className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">{error}</span>
                </div>
              )}

              {selectedFile && (
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={analyzeChart}
                    disabled={isAnalyzing}
                    className="crypto-gradient"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing with GPT-5...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze with GPT-5 AI
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Safety check for required properties */}
              {!analysis.symbol || !analysis.pattern ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-500">Analysis Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      The analysis data is incomplete. Please try analyzing the chart again.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Mock data notice */}
                  {analysis.note && (
                    <Card className="bg-blue-500/10 border-blue-500/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-400 font-medium">
                            {analysis.note}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(() => {
                    try {
                      // Debug logging
                      console.log('Rendering analysis with data:', {
                        symbol: analysis.symbol,
                        pattern: analysis.pattern,
                        entryPrice: analysis.entryPrice,
                        targetPrice: analysis.targetPrice,
                        stopLoss: analysis.stopLoss,
                        keyLevels: analysis.keyLevels
                      });

                      return (
                        <>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="font-medium">Symbol:</span>
                                  <span>{safeRender(analysis.symbol, 'Unknown')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Pattern:</span>
                                  <span>{safeRender(analysis.pattern, 'Unknown')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Trend:</span>
                                  <Badge variant={analysis.trend === 'bullish' ? 'default' : analysis.trend === 'bearish' ? 'destructive' : 'secondary'}>
                                    {safeRender(analysis.trend, 'neutral')}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Timeframe:</span>
                                  <span>{safeRender(analysis.timeframe, 'Unknown')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Confidence:</span>
                                  <span>{Number(analysis.confidence || 0)}%</span>
                                </div>
                </CardContent>
              </Card>

                {/* Price Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Entry Price:</span>
                      <span className="text-green-500">
                        {safeRender(analysis.entryPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Target Price:</span>
                      <span className="text-blue-500">
                        {safeRender(analysis.targetPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stop Loss:</span>
                      <span className="text-red-500">
                        {safeRender(analysis.stopLoss)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Risk/Reward:</span>
                      <span>{Number(analysis.riskRewardRatio || 1)}:1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Risk Level:</span>
                      <Badge variant={analysis.riskLevel === 'low' ? 'default' : analysis.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                        {String(analysis.riskLevel || 'medium')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Crypto Context */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Crypto Market Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{String(analysis.cryptoContext || 'Market context not available')}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-400">Risk Factors</h4>
                      <ul className="space-y-1">
                        {Array.isArray(analysis.riskFactors) ? analysis.riskFactors.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {String(risk || 'Risk factor not available')}</li>
                        )) : (
                          <li className="text-sm text-muted-foreground">• No risk factors available</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-400">Position Sizing</h4>
                      <p className="text-sm text-muted-foreground">{String(analysis.positionSizing || 'Position sizing not available')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Levels */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-400">Support Levels</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Handle different keyLevels formats
                          if (Array.isArray(analysis.keyLevels.support)) {
                            // Array format: { support: string[], resistance: string[] }
                            return analysis.keyLevels.support.map((level, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm">{String(level)}</span>
                              </div>
                            ));
                          } else if (analysis.keyLevels.support && typeof analysis.keyLevels.support === 'object') {
                            // Object format: { level1: value, level2: value }
                            return Object.entries(analysis.keyLevels.support).map(([levelName, levelValue]) => (
                              <div key={levelName} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm font-medium">{levelName}:</span>
                                <span className="text-sm">{String(levelValue)}</span>
                              </div>
                            ));
                          } else if (typeof analysis.keyLevels === 'object' && !Array.isArray(analysis.keyLevels)) {
                            // Timeframe format: { "4H": { support: {...}, resistance: {...} } }
                            const timeframes = Object.keys(analysis.keyLevels);
                            if (timeframes.length > 0) {
                              const firstTimeframe = timeframes[0];
                              const levels = (analysis.keyLevels as Record<string, any>)[firstTimeframe];
                              if (levels && levels.support) {
                                if (Array.isArray(levels.support)) {
                                  return levels.support.map((level: any, index: number) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-sm">{String(level)}</span>
                                    </div>
                                  ));
                                } else if (typeof levels.support === 'object') {
                                  return Object.entries(levels.support).map(([levelName, levelValue]) => (
                                    <div key={levelName} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-sm font-medium">{levelName}:</span>
                                      <span className="text-sm">{String(levelValue)}</span>
                                    </div>
                                  ));
                                }
                              }
                            }
                          }
                          // Fallback
                          return <div className="text-sm text-muted-foreground">No support levels available</div>;
                        })()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-red-400">Resistance Levels</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Handle different keyLevels formats
                          if (Array.isArray(analysis.keyLevels.resistance)) {
                            // Array format: { support: string[], resistance: string[] }
                            return analysis.keyLevels.resistance.map((level, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-sm">{String(level)}</span>
                              </div>
                            ));
                          } else if (analysis.keyLevels.resistance && typeof analysis.keyLevels.resistance === 'object') {
                            // Object format: { level1: value, level2: value }
                            return Object.entries(analysis.keyLevels.resistance).map(([levelName, levelValue]) => (
                              <div key={levelName} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-sm font-medium">{levelName}:</span>
                                <span className="text-sm">{String(levelValue)}</span>
                              </div>
                            ));
                          } else if (typeof analysis.keyLevels === 'object' && !Array.isArray(analysis.keyLevels)) {
                            // Timeframe format: { "4H": { support: {...}, resistance: {...} } }
                            const timeframes = Object.keys(analysis.keyLevels);
                            if (timeframes.length > 0) {
                              const firstTimeframe = timeframes[0];
                              const levels = (analysis.keyLevels as Record<string, any>)[firstTimeframe];
                              if (levels && levels.resistance) {
                                if (Array.isArray(levels.resistance)) {
                                  return levels.resistance.map((level: any, index: number) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                                      <span className="text-sm">{String(level)}</span>
                                    </div>
                                  ));
                                } else if (typeof levels.resistance === 'object') {
                                  return Object.entries(levels.resistance).map(([levelName, levelValue]) => (
                                    <div key={levelName} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                                      <span className="text-sm font-medium">{levelName}:</span>
                                      <span className="text-sm">{String(levelValue)}</span>
                                    </div>
                                  ));
                                }
                              }
                            }
                          }
                          // Fallback
                          return <div className="text-sm text-muted-foreground">No resistance levels available</div>;
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Analysis</h4>
                    <p className="text-muted-foreground">{String(analysis.analysis || 'Analysis not available')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Volume Analysis</h4>
                    <p className="text-muted-foreground">{String(analysis.volumeAnalysis || 'Volume analysis not available')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technical Indicators</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {Array.isArray(analysis.technicalIndicators) ? analysis.technicalIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{String(indicator || 'Indicator not available')}</span>
                        </div>
                      )) : (
                        <div className="text-sm text-muted-foreground">No technical indicators available</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trading Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(analysis.recommendations) ? analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{String(recommendation || 'Recommendation not available')}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">No recommendations available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
                        </>
                      );
                    } catch (error) {
                      console.error('Error rendering analysis:', error);
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg text-red-500">Rendering Error</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              An error occurred while rendering the analysis. Please try again.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Error: {String(error)}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    }
                  })()}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button className="crypto-gradient">
              <Target className="w-4 h-4 mr-2" />
              Generate Signal
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Analyze Another Chart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

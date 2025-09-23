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
import { ChartAnalysisResponse } from '@/lib/geminiService';
import { validateImageFile, formatAnalysisData, getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function ChartUpload() {
  const { user, updateCredits, refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ChartAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [showCreditDeduction, setShowCreditDeduction] = useState(false);
  const [timeframe, setTimeframe] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error!);
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
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const analyzeChart = async () => {
    if (!selectedFile) return;

    // Check if user has enough credits
    if (user && user.credits < 1) {
      setError('Insufficient credits. You need at least 1 credit to analyze charts.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(selectedFile);
      
      // Call Gemini 2.5 Flash API
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          fileType: selectedFile.type,
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

      // Format analysis data using utility function
      const sanitizedAnalysis = formatAnalysisData(data.analysis);

      console.log('Original analysis data:', data.analysis);
      console.log('Sanitized analysis data:', sanitizedAnalysis);

      setAnalysis(sanitizedAnalysis);
      // Notify other components (e.g., history) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analysis:created'));
      }

      // Refresh user credits after successful analysis
      if (user) {
        // Show credit deduction animation
        setShowCreditDeduction(true);
        updateCredits(user.credits - 1);
        
        // Hide animation after 2 seconds
        setTimeout(() => setShowCreditDeduction(false), 2000);
        
        await refreshUser();
        // notify navbar to refresh credits immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('credits:refresh'));
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
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
      <div className="text-center animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-2 professional-heading">Chart Analysis</h2>
            <p className="text-gray-400 professional-text">
              Upload your trading chart and get AI-powered analysis using Gemini 2.5 Flash
            </p>
            
            {/* Credit Deduction Animation */}
            {showCreditDeduction && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg animate-pulse">
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">-1 Credit Deducted</span>
                </div>
              </div>
            )}
        <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Supports PNG, JPG, JPEG
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            Max 10MB file size
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
            Instant analysis
          </span>
        </div>
      </div>

          {!analysis ? (
            <Card className="clean-card hover-lift animate-fade-in-up animate-delay-200">
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 hover-lift ${
                      selectedFile
                        ? 'border-white/50 bg-white/5 border-glow'
                        : 'border-white/30 hover:border-white/50 hover:border-glow'
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
                      className="mt-4 border-glow hover-lift"
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
                    className="professional-button hover-lift"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing with Gemini 2.5 Flash...
                      </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Analyze with Gemini 2.5 Flash
                          </>
                        )}
                  </Button>
                  
                  <Button variant="outline" onClick={resetForm} className="border-glow hover-lift">
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
                <Card className="clean-card">
                  <CardHeader>
                    <CardTitle className="text-lg professional-heading">Basic Information</CardTitle>
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
                <Card className="clean-card">
                  <CardHeader>
                    <CardTitle className="text-lg professional-heading">Price Levels</CardTitle>
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
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg professional-heading">Crypto Market Context</CardTitle>
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
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg professional-heading">Key Levels</CardTitle>
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
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg professional-heading">Technical Analysis</CardTitle>
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
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg professional-heading">Trading Recommendations</CardTitle>
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
            <Button className="professional-button">
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

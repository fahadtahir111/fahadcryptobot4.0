import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Chart analysis utilities
export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return `$${price.toLocaleString()}`;
  }
  if (typeof price === 'string') {
    // Remove any existing currency symbols and format
    const cleanPrice = price.replace(/[$,]/g, '');
    const numPrice = parseFloat(cleanPrice);
    if (!isNaN(numPrice)) {
      return `$${numPrice.toLocaleString()}`;
    }
  }
  return price.toString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatRiskReward(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

// Validation utilities
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (PNG, JPG, JPEG)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Please select an image under 10MB.' };
  }

  return { valid: true };
}

// Chart analysis result utilities
export function getTrendColor(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'bullish':
      return 'text-green-400';
    case 'bearish':
      return 'text-red-400';
    default:
      return 'text-yellow-400';
  }
}

export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

// API response utilities
export function sanitizeApiResponse(data: any): any {
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'number') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeApiResponse(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeApiResponse(value);
    }
    return sanitized;
  }

  return data;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Chart analysis formatting
export function formatAnalysisData(analysis: any) {
  return {
    symbol: String(analysis.symbol || 'Unknown'),
    pattern: String(analysis.pattern || 'Unknown Pattern'),
    trend: analysis.trend || 'neutral',
    entryPrice: formatPrice(analysis.entryPrice || 'N/A'),
    targetPrice: formatPrice(analysis.targetPrice || 'N/A'),
    stopLoss: formatPrice(analysis.stopLoss || 'N/A'),
    confidence: Number(analysis.confidence || 0),
    analysis: String(analysis.analysis || 'Analysis not available'),
    riskLevel: analysis.riskLevel || 'medium',
    timeframe: String(analysis.timeframe || 'Unknown'),
    riskRewardRatio: Number(analysis.riskRewardRatio || 1.0),
    keyLevels: analysis.keyLevels || { support: [], resistance: [] },
    volumeAnalysis: String(analysis.volumeAnalysis || 'Volume analysis not available'),
    technicalIndicators: Array.isArray(analysis.technicalIndicators)
      ? analysis.technicalIndicators.map(String)
      : [],
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations.map(String)
      : [],
    cryptoContext: String(analysis.cryptoContext || 'Market context not available'),
    riskFactors: Array.isArray(analysis.riskFactors)
      ? analysis.riskFactors.map(String)
      : [],
    positionSizing: String(analysis.positionSizing || 'Position sizing not available'),
    tradeType: analysis.tradeType || 'SWING',
    isSwap: !!analysis.isSwap,
    marketDeepDive: String(analysis.marketDeepDive || 'Deep dive not available'),
    note: analysis.note
  };
}
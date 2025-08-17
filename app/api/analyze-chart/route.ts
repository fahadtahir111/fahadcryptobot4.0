import { NextRequest, NextResponse } from 'next/server';
import { gpt5Service } from '@/lib/gpt5Service';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, symbol, timeframe, additionalContext } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('No API key configured, returning mock data for testing');
      // Return mock data for testing when no API key is configured
      const mockAnalysis = {
        symbol: symbol || 'BTC/USDT',
        pattern: 'Ascending Triangle',
        trend: 'bullish',
        entryPrice: '$43,250',
        targetPrice: '$45,800',
        stopLoss: '$42,100',
        confidence: 87,
        analysis: 'The chart shows a strong ascending triangle pattern with increasing volume. Support is holding at $42,100 while resistance is being tested at $43,800. The breakout above resistance would confirm the bullish continuation with a target of $45,800. Risk-reward ratio is favorable at 1:2.5.',
        riskLevel: 'medium',
        timeframe: timeframe || '4H',
        riskRewardRatio: 2.5,
        keyLevels: {
          support: ['$42,100', '$41,500'],
          resistance: ['$43,800', '$44,200']
        },
        volumeAnalysis: 'Volume is increasing on upward moves, indicating strong buying pressure and confirming the bullish bias.',
        technicalIndicators: ['RSI: 65 (neutral)', 'MACD: Bullish crossover', 'Moving Averages: Price above 50MA'],
        recommendations: [
          'Wait for breakout above $43,800 resistance',
          'Set stop loss at $42,100',
          'Target $45,800 for profit taking',
          'Monitor volume for confirmation'
        ],
        cryptoContext: 'Market cycle position, halving impact, institutional activity',
        riskFactors: ['Specific risks for this crypto asset'],
        positionSizing: 'Recommended position size based on volatility'
      };

      return NextResponse.json({ 
        success: true, 
        analysis: mockAnalysis,
        timestamp: new Date().toISOString(),
        note: 'Mock data returned - configure OPENROUTER_API_KEY for real AI analysis'
      });
    }

    // Validate API key
    const isApiKeyValid = await gpt5Service.validateApiKey();
    if (!isApiKeyValid) {
      return NextResponse.json({ 
        error: 'OpenRouter API key not configured or invalid',
        details: 'Please configure OPENROUTER_API_KEY in your environment variables'
      }, { status: 500 });
    }

    // Analyze chart using AI
    const analysis = await gpt5Service.analyzeChart({
      imageBase64,
      symbol,
      timeframe,
      additionalContext,
    });

    return NextResponse.json({ 
      success: true, 
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chart analysis error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OpenRouter API key')) {
        return NextResponse.json({ 
          error: 'API key configuration error',
          details: error.message 
        }, { status: 500 });
      }
      
      if (error.message.includes('OpenRouter API error')) {
        return NextResponse.json({ 
          error: 'OpenRouter API error',
          details: error.message 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to analyze chart',
      details: 'An unexpected error occurred during analysis'
    }, { status: 500 });
  }
}

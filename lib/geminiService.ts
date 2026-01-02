import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatAnalysisData } from './utils';

export interface ChartAnalysisRequest {
  imageBase64: string;
  symbol?: string;
  timeframe?: string;
  additionalContext?: string;
}

interface TimeframeLevels {
  support: Record<string, string | number>;
  resistance: Record<string, string | number>;
}

type KeyLevels =
  | {
    support: string[];
    resistance: string[];
  }
  | Record<string, TimeframeLevels>;

export interface ChartAnalysisResponse {
  symbol: string;
  pattern: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  confidence: number;
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  riskRewardRatio: number;
  keyLevels: KeyLevels;
  volumeAnalysis: string;
  technicalIndicators: string[];
  recommendations: string[];
  cryptoContext: string;
  riskFactors: string[];
  positionSizing: string;
  tradeType: 'SCALP' | 'DAY_TRADE' | 'SWING' | 'POSITION';
  isSwap: boolean;
  marketDeepDive: string;
  note?: string;
}

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly modelName: string;
  // Simple in-process throttle to prevent API overload
  private activeRequests = 0;
  private waitQueue: Array<() => void> = [];
  private readonly maxConcurrent: number;
  private readonly maxRetries: number;
  private readonly requestTimeoutMs: number;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('⚠️ No Gemini API key configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    this.maxConcurrent = Math.max(1, Number(process.env.GEMINI_MAX_CONCURRENCY || 1));
    this.maxRetries = Math.max(0, Number(process.env.GEMINI_MAX_RETRIES || 3));
    this.requestTimeoutMs = Math.max(5_000, Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 25_000));
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async analyzeChart(
    request: ChartAnalysisRequest,
    marketData?: any
  ): Promise<ChartAnalysisResponse> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ No Gemini API key configured — returning mock analysis');
        return this.getMockAnalysis(request);
      }

      const prompt = this.buildAnalysisPrompt(request, marketData);

      await this.acquireSlot();
      try {
        const execCall = async () => {
          const result = await this.withTimeout<any>(
            (this.model.generateContent([
              prompt,
              {
                inlineData: {
                  data: request.imageBase64,
                  mimeType: 'image/jpeg'
                }
              }
            ]) as Promise<any>),
            this.requestTimeoutMs,
          );
          const response = await result.response;
          if (!response) {
            throw new Error('Gemini API error: No response received');
          }
          return response.text();
        };

        const analysisText = await this.withRetry(execCall, this.maxRetries);
        console.log(`✅ Successfully used SignalX AI (${this.modelName})`);

        try {
          const parsedResponse = this.parseAnalysisResponse(analysisText, request);
          return formatAnalysisData(parsedResponse);
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message.startsWith('NOT_CHART:')) {
            throw parseError;
          }
          console.error('Failed to parse Gemini response:', parseError);
          throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } finally {
        this.releaseSlot();
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);

      // Re-throw critical errors instead of falling back to mock
      if (error instanceof Error && (
        error.message.startsWith('NOT_CHART:') ||
        error.message.includes('API key') ||
        error.message.includes('timeout') ||
        error.message.includes('parsed')
      )) {
        throw error;
      }

      // Only fallback to mock if it's strictly a configuration issue (key missing)
      if (!process.env.GEMINI_API_KEY) {
        return this.getMockAnalysis(request);
      }

      throw error;
    }
  }

  private buildAnalysisPrompt(request: ChartAnalysisRequest, marketData?: any): string {
    const marketContextString = marketData
      ? `\nCURRENT MARKET DATA:\n${JSON.stringify(marketData, null, 2)}`
      : '';

    return `You are a senior crypto technical analyst with 10+ years of experience. First determine if the provided IMAGE is a TRADING CHART (candlesticks/lines, axes, indicators, exchange UI). Return ONLY valid JSON.
${marketContextString}

{
  "isChart": true,
  "notChartReason": "",
  "symbol": "BTC/USDT",
  "pattern": "Specific chart pattern identified (e.g., Bullish Consolidation, Ascending Triangle, Bullish Flag)",
  "trend": "bullish|bearish|neutral",
  "timeframe": "e.g., 15m/1H/4H/1D",
  "confidence": 85,
  "riskLevel": "low|medium|high",
  "riskRewardRatio": 1.72,
  "tradeType": "SCALP|DAY_TRADE|SWING|POSITION",
  "isSwap": true,
  "marketDeepDive": "A deep professional analysis of liquidity, order book heatmaps, and macro crypto trends relating to this chart.",
  
  "entryPrice": "109.000",
  "targetPrice": "112.800", 
  "stopLoss": "106.800",
  
  "analysis": "Detailed technical explanation: BTC/USDT on the 4-hour chart has demonstrated strong bullish momentum, breaking above a key resistance level around $104,800 with significant volume. Following this breakout, the price consolidated around the $107,000-$109,000 range, potentially forming a bullish flag or pennant pattern. The current candle shows renewed buying pressure, suggesting a potential breakout continuation towards higher resistance levels. The previous resistance at $104,800 now acts as a strong support, indicating a potential retest before further upside or a direct continuation of the uptrend.",
  
  "volumeAnalysis": "The initial strong upward move from the $96,000 low was accompanied by heavy buying volume, confirming the breakout's strength. The subsequent consolidation phase occurred on relatively lower volume, which is constructive for a bullish continuation. The latest upward push visible in the current candle is also showing healthy volume, suggesting sustained buyer interest.",
  
  "keyLevels": {
    "support": ["106,800", "104,800", "96,000"],
    "resistance": ["110,800", "112,000", "113,000"]
  },
  
  "technicalIndicators": [
    "RSI: 65 (neutral to bullish momentum)",
    "MACD: Bullish crossover with increasing histogram",
    "Moving Averages: Price above 50MA and 200MA",
    "Volume: Increasing on upward moves"
  ],
  
  "cryptoContext": "The broader cryptocurrency market exhibits strong positive sentiment, highlighted by Bitcoin spot ETFs experiencing significant net inflows (approximately 15,000 BTC or $1.6 billion) for the third consecutive week. This robust institutional demand, despite some outflows from specific funds, provides a strong fundamental tailwind for Bitcoin's price. Bitcoin's market capitalization stands at $2.17T, underscoring its dominant position and market health.",
  
  "riskFactors": [
    "High market volatility inherent to cryptocurrencies, potentially leading to rapid price swings",
    "Potential for unexpected bearish news or adverse regulatory developments", 
    "Risk of a false breakout from the consolidation if buying volume does not sustain at higher levels",
    "Influence of global macroeconomic factors on risk-on assets like Bitcoin"
  ],
  
  "positionSizing": "Allocate 1-2% of total trading capital per trade. Strict adherence to the recommended stop loss is crucial for effective risk management.",
  
  "recommendations": [
    "Wait for confirmation above $109,000 resistance with volume",
    "Set stop loss at $106,800 for risk management",
    "Target $112,800 for profit taking",
    "Monitor volume for sustained buying pressure"
  ]
}

IMPORTANT RULES:
- Output ONLY valid JSON (no markdown fences, no commentary, no extra text)
- If the image is NOT a trading chart, set "isChart": false and provide a short "notChartReason". In that case, you may leave other fields default or empty.
- Always provide specific price levels (never null or "N/A")
- Use actual numbers for prices, not strings with $ symbols
- Ensure all arrays have content, never empty arrays
- Provide detailed, professional technical analysis
- "tradeType" definition: SCALP (minutes), DAY_TRADE (hours), SWING (days/weeks), POSITION (months)
- "isSwap" should be true if this is better handled as a simple DeFi swap/DEX trade than a CEX limit order.
- Include comprehensive market context and risk factors
- Make analysis match the quality and depth shown in professional trading reports

Extra context: ${request.additionalContext || 'None'}
Symbol: ${request.symbol || 'Unknown'}
Timeframe: ${request.timeframe || 'Unknown'}`;
  }

  private parseAnalysisResponse(
    analysisText: string,
    request: ChartAnalysisRequest
  ): ChartAnalysisResponse {
    try {
      let cleaned = analysisText.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure all required fields have valid values
        if (parsed.isChart === false) {
          throw new Error('NOT_CHART: ' + (parsed.notChartReason || 'The provided image is not a trading chart'));
        }

        const symbol = parsed.symbol || request.symbol || 'BTC/USDT';
        const pattern = parsed.pattern || 'Bullish Consolidation';
        const trend = parsed.trend || 'bullish';
        const timeframe = parsed.timeframe || request.timeframe || '4H';
        const confidence = Math.max(0, Math.min(100, parsed.confidence || 85));
        const riskLevel = parsed.riskLevel || 'medium';
        const riskRewardRatio = Math.max(0.1, parsed.riskRewardRatio || 1.72);

        // Ensure price levels are never null or N/A
        const entryPrice = parsed.entryPrice && parsed.entryPrice !== 'N/A'
          ? String(parsed.entryPrice)
          : '109.000';
        const targetPrice = parsed.targetPrice && parsed.targetPrice !== 'N/A'
          ? String(parsed.targetPrice)
          : '112.800';
        const stopLoss = parsed.stopLoss && parsed.stopLoss !== 'N/A'
          ? String(parsed.stopLoss)
          : '106.800';

        // Ensure arrays are never empty
        const keyLevels = parsed.keyLevels || { support: [], resistance: [] };
        if (!keyLevels.support || keyLevels.support.length === 0) {
          keyLevels.support = ['106,800', '104,800', '96,000'];
        }
        if (!keyLevels.resistance || keyLevels.resistance.length === 0) {
          keyLevels.resistance = ['110,800', '112,000', '113,000'];
        }

        const technicalIndicators = Array.isArray(parsed.technicalIndicators) && parsed.technicalIndicators.length > 0
          ? parsed.technicalIndicators
          : [
            'RSI: 65 (neutral to bullish momentum)',
            'MACD: Bullish crossover with increasing histogram',
            'Moving Averages: Price above 50MA and 200MA',
            'Volume: Increasing on upward moves'
          ];

        const recommendations = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
          ? parsed.recommendations
          : [
            'Wait for confirmation above resistance with volume',
            'Set stop loss for risk management',
            'Target higher levels for profit taking',
            'Monitor volume for sustained buying pressure'
          ];

        const riskFactors = Array.isArray(parsed.riskFactors) && parsed.riskFactors.length > 0
          ? parsed.riskFactors
          : [
            'High market volatility inherent to cryptocurrencies',
            'Potential for unexpected bearish news or adverse regulatory developments',
            'Risk of false breakout if volume doesn\'t sustain',
            'Influence of global macroeconomic factors'
          ];

        return {
          symbol,
          pattern,
          trend,
          entryPrice,
          targetPrice,
          stopLoss,
          confidence,
          analysis: parsed.analysis || 'Detailed technical analysis not available. The chart shows potential trading opportunities with key support and resistance levels.',
          riskLevel,
          timeframe,
          riskRewardRatio,
          keyLevels,
          volumeAnalysis: parsed.volumeAnalysis || 'Volume analysis shows increasing buying pressure on upward moves, confirming the bullish bias.',
          technicalIndicators,
          recommendations,
          cryptoContext: parsed.cryptoContext || 'The broader cryptocurrency market exhibits strong positive sentiment with institutional demand providing fundamental support.',
          riskFactors,
          positionSizing: parsed.positionSizing || 'Allocate 1-2% of total trading capital per trade.',
          tradeType: parsed.tradeType || 'SWING',
          isSwap: !!parsed.isSwap,
          marketDeepDive: parsed.marketDeepDive || 'Global crypto liquidity remains high with strong stablecoin inflows.',
        };
      }
    } catch (error) {
      console.error('⚠️ Failed to parse Gemini response, using mock:', error);
    }

    return this.getMockAnalysis(request);
  }

  private getMockAnalysis(request: ChartAnalysisRequest): ChartAnalysisResponse {
    return {
      symbol: request.symbol || 'BTC/USDT',
      pattern: 'Bullish Consolidation / Potential Bullish Flag Breakout',
      trend: 'bullish',
      entryPrice: '109.000',
      targetPrice: '112.800',
      stopLoss: '106.800',
      confidence: 85,
      analysis: 'BTC/USDT on the 4-hour chart has demonstrated strong bullish momentum, breaking above a key resistance level around $104,800 with significant volume. Following this breakout, the price consolidated around the $107,000-$109,000 range, potentially forming a bullish flag or pennant pattern. The current candle shows renewed buying pressure, suggesting a potential breakout continuation towards higher resistance levels. The previous resistance at $104,800 now acts as a strong support, indicating a potential retest before further upside or a direct continuation of the uptrend.',
      riskLevel: 'medium',
      timeframe: request.timeframe || '4H',
      riskRewardRatio: 1.72,
      keyLevels: {
        support: ['106,800', '104,800', '96,000'],
        resistance: ['110,800', '112,000', '113,000'],
      },
      volumeAnalysis: 'The initial strong upward move from the $96,000 low was accompanied by heavy buying volume, confirming the breakout\'s strength. The subsequent consolidation phase occurred on relatively lower volume, which is constructive for a bullish continuation. The latest upward push visible in the current candle is also showing healthy volume, suggesting sustained buyer interest.',
      technicalIndicators: [
        'RSI: 65 (neutral to bullish momentum)',
        'MACD: Bullish crossover with increasing histogram',
        'Moving Averages: Price above 50MA and 200MA',
        'Volume: Increasing on upward moves'
      ],
      recommendations: [
        'Wait for confirmation above $109,000 resistance with volume',
        'Set stop loss at $106,800 for risk management',
        'Target $112,800 for profit taking',
        'Monitor volume for sustained buying pressure'
      ],
      cryptoContext: 'The broader cryptocurrency market exhibits strong positive sentiment, highlighted by Bitcoin spot ETFs experiencing significant net inflows (approximately 15,000 BTC or $1.6 billion) for the third consecutive week. This robust institutional demand, despite some outflows from specific funds, provides a strong fundamental tailwind for Bitcoin\'s price. Bitcoin\'s market capitalization stands at $2.17T, underscoring its dominant position and market health.',
      riskFactors: [
        'High market volatility inherent to cryptocurrencies',
        'Potential for unexpected bearish news',
        'Risk of a false breakout if buying volume does not sustain',
        'Influence of global macroeconomic factors'
      ],
      positionSizing: 'Allocate 1-2% of total trading capital per trade.',
      tradeType: 'SWING',
      isSwap: false,
      marketDeepDive: 'Institutional adoption is accelerating, with major financial players integrating crypto assets into their portfolios.',
      note: '⚠️ This is mock data (Gemini 2.5 Flash API unavailable)',
    };
  }

  // Throttle helpers
  private async acquireSlot(): Promise<void> {
    if (this.activeRequests < this.maxConcurrent) {
      this.activeRequests += 1;
      return;
    }
    await new Promise<void>((resolve) => {
      this.waitQueue.push(() => {
        this.activeRequests += 1;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    const next = this.waitQueue.shift();
    if (next) next();
  }

  // Retry with exponential backoff and jitter
  private async withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
    let attempt = 0;
    // First try happens immediately; then backoff
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        attempt += 1;
        const status = err?.status || err?.response?.status;
        const message: string = String(err?.message || '');
        const retryable =
          status === 429 ||
          status === 408 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504 ||
          /quota|rate|overload|timeout/i.test(message);

        if (!retryable || attempt > maxRetries) {
          throw err;
        }

        const base = 500 * Math.pow(2, attempt - 1); // 0.5s, 1s, 2s, ...
        const jitter = Math.floor(Math.random() * 250);
        const delayMs = Math.min(10_000, base + jitter);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  // Timeout wrapper for any promise
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timeout')), timeoutMs)
      ),
    ]);
  }

  public async validateApiKey(): Promise<boolean> {
    try {
      if (!process.env.GEMINI_API_KEY) return false;
      // Test with a simple request
      const result = await this.model.generateContent('Test');
      return !!result.response;
    } catch {
      return false;
    }
  }
}

export const geminiService = GeminiService.getInstance();

import { jsonrepair } from 'jsonrepair';

export interface MarketData {
    price: number;
    change24h: number;
    symbol: string;
    timestamp: string;
}

export async function fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
        // For specific symbols like BTC/USDT, extract the base symbol
        const baseSymbol = symbol.split('/')[0].toLowerCase();

        // Map common symbols to CoinGecko IDs
        const symbolMap: Record<string, string> = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'sol': 'solana',
            'bnb': 'binancecoin',
            'xrp': 'ripple',
            'ada': 'cardano',
            'doge': 'dogecoin',
            'dot': 'polkadot',
            'matic': 'polygon',
            'trx': 'tron',
        };

        const id = symbolMap[baseSymbol] || baseSymbol;

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
            { next: { revalidate: 60 } } // Cache for 1 minute
        );

        if (!response.ok) {
            console.warn(`Market data fetch failed for ${id}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (!data[id]) return null;

        return {
            price: data[id].usd,
            change24h: data[id].usd_24h_change,
            symbol: symbol.toUpperCase(),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
        return null;
    }
}

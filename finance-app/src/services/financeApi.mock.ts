/**
 * In-memory mock implementation of fetchMarketData.
 * Used by tests and Storybook — never imported in production builds.
 *
 * Re-export the same signature as financeApi.ts so components / hooks
 * can swap implementations via Vitest module mocking.
 */
import type { MarketData, TimeWindow } from './types';
import { TICKER_NAMES } from './types';

const ONE_DAY_MS = 86_400_000;

/** Build a synthetic price history for the last `days` calendar days. */
function buildHistory(
  basePx: number,
  days: number,
): { date: string; close: number }[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * ONE_DAY_MS);
    const jitter = (Math.sin(i * 1.3 + basePx) * 0.03 + Math.random() * 0.01) * basePx;
    return {
      date: d.toISOString().slice(0, 10),
      close: parseFloat((basePx + jitter).toFixed(2)),
    };
  });
}

const BASE_PRICES: Record<string, number> = {
  IBM: 185.4,
  MSFT: 415.2,
  ORCL: 122.8,
  SAP: 198.6,
  CRM: 274.3,
};

function windowToDays(window: TimeWindow): number {
  switch (window) {
    case 'day':
      return 1;
    case '7d':
      return 7;
    case 'quarter':
      return 90;
  }
}

export async function fetchMarketData(
  ticker: string,
  window: TimeWindow,
): Promise<MarketData> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 80));

  const base = BASE_PRICES[ticker.toUpperCase()] ?? 100;
  const change = parseFloat(((Math.random() - 0.5) * 4).toFixed(2));
  const changePct = parseFloat(((change / base) * 100).toFixed(2));
  const days = windowToDays(window);

  return {
    quote: {
      ticker: ticker.toUpperCase(),
      name: TICKER_NAMES[ticker.toUpperCase()] ?? ticker,
      price: base + change,
      change,
      changePct,
      timestamp: Date.now(),
    },
    history: buildHistory(base, days),
  };
}

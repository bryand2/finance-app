import type { MarketData, TimeWindow } from './types';
import { normalizeMarketData } from '../utils/normalize';

/** Base URL for the lightweight backend proxy (see server/index.ts). */
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/finance';

/** Map a TimeWindow to the number of calendar days of history to request. */
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

/**
 * Fetch market data for a single ticker from the backend proxy.
 *
 * The proxy exposes:
 *   GET /api/finance/:ticker/quote
 *   GET /api/finance/:ticker/history?days=N
 *
 * Throws an Error if either request fails or the response is not usable.
 */
export async function fetchMarketData(
  ticker: string,
  window: TimeWindow,
): Promise<MarketData> {
  const days = windowToDays(window);
  const quoteUrl = `${API_BASE}/${ticker}/quote`;
  const historyUrl = `${API_BASE}/${ticker}/history?days=${days}`;

  const [quoteRes, historyRes] = await Promise.all([
    fetch(quoteUrl),
    fetch(historyUrl),
  ]);

  if (!quoteRes.ok) {
    throw new Error(
      `Quote fetch failed for ${ticker}: ${quoteRes.status} ${quoteRes.statusText}`,
    );
  }
  if (!historyRes.ok) {
    throw new Error(
      `History fetch failed for ${ticker}: ${historyRes.status} ${historyRes.statusText}`,
    );
  }

  const [rawQuote, rawHistory] = await Promise.all([
    quoteRes.json(),
    historyRes.json(),
  ]);

  const data = normalizeMarketData(rawQuote, rawHistory, ticker);
  if (!data) {
    throw new Error(`Could not normalize market data for ${ticker}`);
  }
  return data;
}

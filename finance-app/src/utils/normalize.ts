import type { HistoricalPoint, MarketData, Quote } from '../services/types';
import { TICKER_NAMES } from '../services/types';

/**
 * Shape returned by the /api/finance/:ticker/quote proxy endpoint.
 * Mirrors the yahoo-finance2 quoteSummary "price" module keys we actually use.
 */
export interface RawQuote {
  symbol?: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: number;
}

/**
 * Shape returned by the /api/finance/:ticker/history proxy endpoint.
 * Mirrors the yahoo-finance2 historical result array.
 */
export interface RawHistoricalItem {
  date?: string | number | Date;
  close?: number;
}

/** Convert a raw quote payload into a typed Quote. Returns null on bad data. */
export function normalizeQuote(raw: RawQuote, ticker: string): Quote | null {
  try {
    const price = raw.regularMarketPrice;
    if (price == null || !isFinite(price)) return null;

    return {
      ticker: ticker.toUpperCase(),
      name: raw.shortName ?? TICKER_NAMES[ticker.toUpperCase()] ?? ticker,
      price,
      change: raw.regularMarketChange ?? 0,
      changePct: raw.regularMarketChangePercent ?? 0,
      timestamp: raw.regularMarketTime
        ? raw.regularMarketTime * 1000
        : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Convert a raw historical array into typed HistoricalPoint[]. Filters bad rows. */
export function normalizeHistory(
  raw: RawHistoricalItem[],
): HistoricalPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.reduce<HistoricalPoint[]>((acc, item) => {
    try {
      if (item.close == null || !isFinite(item.close)) return acc;
      const dateStr =
        item.date instanceof Date
          ? item.date.toISOString().slice(0, 10)
          : typeof item.date === 'number'
            ? new Date(item.date).toISOString().slice(0, 10)
            : typeof item.date === 'string'
              ? item.date.slice(0, 10)
              : null;
      if (!dateStr) return acc;
      acc.push({ date: dateStr, close: item.close });
    } catch {
      /* skip malformed row */
    }
    return acc;
  }, []);
}

/** Combine normalizeQuote + normalizeHistory into a MarketData bundle. */
export function normalizeMarketData(
  rawQuote: RawQuote,
  rawHistory: RawHistoricalItem[],
  ticker: string,
): MarketData | null {
  const quote = normalizeQuote(rawQuote, ticker);
  if (!quote) return null;
  return { quote, history: normalizeHistory(rawHistory) };
}

/**
 * Fixture data for tests.
 * Mirrors the shapes expected by normalizeQuote / normalizeHistory.
 */
import type { RawQuote, RawHistoricalItem } from '../../utils/normalize';

export const RAW_IBM_QUOTE: RawQuote = {
  symbol: 'IBM',
  shortName: 'IBM',
  regularMarketPrice: 185.4,
  regularMarketChange: 1.2,
  regularMarketChangePercent: 0.65,
  regularMarketTime: Math.floor(Date.now() / 1000),
};

export const RAW_IBM_HISTORY: RawHistoricalItem[] = [
  { date: '2024-03-01', close: 183.1 },
  { date: '2024-03-04', close: 184.5 },
  { date: '2024-03-05', close: 185.4 },
];

export const RAW_INVALID_QUOTE: RawQuote = {
  symbol: 'BAD',
  regularMarketPrice: undefined,
};

export const RAW_INVALID_HISTORY: RawHistoricalItem[] = [
  { date: undefined, close: undefined },
  { date: '2024-03-01', close: undefined },
  { date: '2024-03-02', close: NaN },
];

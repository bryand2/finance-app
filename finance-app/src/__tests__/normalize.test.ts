import { describe, it, expect } from 'vitest';
import {
  normalizeQuote,
  normalizeHistory,
  normalizeMarketData,
} from '../utils/normalize';
import {
  RAW_IBM_QUOTE,
  RAW_IBM_HISTORY,
  RAW_INVALID_QUOTE,
  RAW_INVALID_HISTORY,
} from './fixtures/marketData';

describe('normalizeQuote', () => {
  it('converts a valid raw quote into a typed Quote', () => {
    const result = normalizeQuote(RAW_IBM_QUOTE, 'IBM');
    expect(result).not.toBeNull();
    expect(result?.ticker).toBe('IBM');
    expect(result?.price).toBe(185.4);
    expect(result?.change).toBe(1.2);
    expect(result?.changePct).toBeCloseTo(0.65);
    expect(result?.name).toBe('IBM');
  });

  it('returns null when regularMarketPrice is undefined', () => {
    expect(normalizeQuote(RAW_INVALID_QUOTE, 'BAD')).toBeNull();
  });

  it('falls back to ticker as name when shortName is absent', () => {
    const result = normalizeQuote({ regularMarketPrice: 50 }, 'XYZ');
    expect(result?.name).toBe('XYZ');
  });
});

describe('normalizeHistory', () => {
  it('converts a valid raw history array', () => {
    const result = normalizeHistory(RAW_IBM_HISTORY);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2024-03-01', close: 183.1 });
  });

  it('filters out rows with null/NaN close values', () => {
    const result = normalizeHistory(RAW_INVALID_HISTORY);
    expect(result).toHaveLength(0);
  });

  it('returns an empty array for non-array input', () => {
    // @ts-expect-error intentional bad input
    expect(normalizeHistory(null)).toEqual([]);
  });

  it('handles Date object date fields', () => {
    const d = new Date('2024-03-15');
    const result = normalizeHistory([{ date: d, close: 100 }]);
    expect(result[0].date).toBe('2024-03-15');
  });
});

describe('normalizeMarketData', () => {
  it('returns a combined MarketData bundle for valid inputs', () => {
    const result = normalizeMarketData(RAW_IBM_QUOTE, RAW_IBM_HISTORY, 'IBM');
    expect(result).not.toBeNull();
    expect(result?.quote.ticker).toBe('IBM');
    expect(result?.history).toHaveLength(3);
  });

  it('returns null when the quote is invalid', () => {
    expect(normalizeMarketData(RAW_INVALID_QUOTE, RAW_IBM_HISTORY, 'BAD')).toBeNull();
  });
});

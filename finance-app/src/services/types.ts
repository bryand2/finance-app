/** The three supported dashboard time windows. */
export type TimeWindow = 'day' | '7d' | 'quarter';

/** Real-time or delayed quote snapshot for a single ticker. */
export interface Quote {
  ticker: string;
  name: string;
  price: number;
  /** Absolute price change from previous close */
  change: number;
  /** Percentage change from previous close */
  changePct: number;
  /** Unix timestamp (ms) of the quote */
  timestamp: number;
}

/** One closing-price data point for historical chart series. */
export interface HistoricalPoint {
  /** ISO-8601 date string, e.g. "2024-03-15" */
  date: string;
  close: number;
}

/** Combined quote + history bundle delivered to the UI. */
export interface MarketData {
  quote: Quote;
  history: HistoricalPoint[];
}

/** One named chart series (one company) ready for Recharts. */
export interface ChartSeries {
  ticker: string;
  name: string;
  data: HistoricalPoint[];
}

/** Canonical ticker symbols used throughout the app. */
export const DEFAULT_TICKERS = ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM'] as const;
export type DefaultTicker = (typeof DEFAULT_TICKERS)[number];

/** Human-readable names keyed by ticker. */
export const TICKER_NAMES: Record<string, string> = {
  IBM: 'IBM',
  MSFT: 'Microsoft',
  ORCL: 'Oracle',
  SAP: 'SAP',
  CRM: 'Salesforce',
};

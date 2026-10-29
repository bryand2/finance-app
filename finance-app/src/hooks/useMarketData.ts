import { useQueries } from '@tanstack/react-query';
import type { MarketData, TimeWindow } from '../services/types';
import { fetchMarketData } from '../services/financeApi';

export interface UseMarketDataResult {
  /** Successfully loaded data keyed by ticker. */
  dataByTicker: Record<string, MarketData>;
  /** Tickers that are currently loading. */
  loadingTickers: string[];
  /** Per-ticker errors (only tickers with failures are included). */
  errorByTicker: Record<string, Error>;
  /** True when every ticker has settled (either data or error). */
  isSettled: boolean;
}

/**
 * Fetch MarketData for each ticker in parallel using React Query.
 * Re-fetches automatically when `tickers` or `window` change.
 */
export function useMarketData(
  tickers: string[],
  window: TimeWindow,
): UseMarketDataResult {
  const results = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ['market', ticker, window] as const,
      queryFn: () => fetchMarketData(ticker, window),
      staleTime: 60_000,       // consider data fresh for 60 s
      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
    })),
  });

  const dataByTicker: Record<string, MarketData> = {};
  const loadingTickers: string[] = [];
  const errorByTicker: Record<string, Error> = {};

  results.forEach((result, i) => {
    const ticker = tickers[i];
    if (result.isPending) {
      loadingTickers.push(ticker);
    } else if (result.isError) {
      errorByTicker[ticker] =
        result.error instanceof Error
          ? result.error
          : new Error(String(result.error));
    } else if (result.data) {
      dataByTicker[ticker] = result.data;
    }
  });

  const isSettled = results.every((r) => !r.isPending);

  return { dataByTicker, loadingTickers, errorByTicker, isSettled };
}

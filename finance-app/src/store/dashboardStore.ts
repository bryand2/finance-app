import { create } from 'zustand';
import type { TimeWindow } from '../services/types';
import { DEFAULT_TICKERS } from '../services/types';

interface DashboardState {
  /** The currently selected time window for all dashboards. */
  activeWindow: TimeWindow;
  /** The fixed set of tracked tickers (IBM + 4 competitors). */
  tickers: string[];
  /**
   * An optional user-supplied ticker for the custom company chart.
   * null means the custom chart panel is hidden.
   * (Extension point for the Part 2 "user-selected company" feature.)
   */
  customTicker: string | null;

  setWindow: (window: TimeWindow) => void;
  setCustomTicker: (ticker: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  activeWindow: 'day',
  tickers: [...DEFAULT_TICKERS],
  customTicker: null,

  setWindow: (window) => set({ activeWindow: window }),
  setCustomTicker: (ticker) =>
    set({ customTicker: ticker ? ticker.toUpperCase() : null }),
}));

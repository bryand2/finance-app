import type { MarketData, TimeWindow } from '../../services/types';

interface CompanyCardProps {
  data: MarketData;
  window: TimeWindow;
  /** Highlight this card (used for IBM in the Today view). */
  featured?: boolean;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(change: number, pct: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
}

/**
 * Compute the percentage change across the loaded history window.
 * Returns null when there are fewer than 2 data points.
 */
function windowChangePct(data: MarketData): number | null {
  const h = data.history;
  if (h.length < 2) return null;
  const first = h[0].close;
  const last = h[h.length - 1].close;
  if (!first) return null;
  return ((last - first) / first) * 100;
}

export function CompanyCard({ data, window, featured = false }: CompanyCardProps) {
  const { quote } = data;
  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? 'change--positive' : 'change--negative';

  // For 7d / quarter views, also show the window-level % move
  const periodPct = window !== 'day' ? windowChangePct(data) : null;
  const periodPositive = periodPct !== null && periodPct >= 0;

  return (
    <div
      className={`company-card${featured ? ' company-card--featured' : ''}`}
      data-ticker={quote.ticker}
    >
      <div className="card-header">
        <span className="card-ticker">{quote.ticker}</span>
        <span className="card-name">{quote.name}</span>
      </div>

      <div className="card-price">{formatPrice(quote.price)}</div>

      {/* Day change — always shown */}
      <div className={`card-change ${changeClass}`}>
        <span className="change-arrow" aria-hidden="true">
          {isPositive ? '▲' : '▼'}
        </span>
        {formatChange(quote.change, quote.changePct)}
      </div>

      {/* Period change badge — shown for 7d and quarter views */}
      {periodPct !== null && (
        <div className={`card-period-badge ${periodPositive ? 'badge--positive' : 'badge--negative'}`}>
          <span className="badge-label">
            {window === '7d' ? '7-day' : 'Quarter'}
          </span>
          <span className="badge-value">
            {periodPositive ? '+' : ''}{periodPct.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

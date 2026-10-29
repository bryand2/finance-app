import { useDashboardStore } from '../../store/dashboardStore';
import { useMarketData } from '../../hooks/useMarketData';
import { CompanyCard } from './CompanyCard';
import { ComparisonChart } from './ComparisonChart';
import { RankingChart } from './RankingChart';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBanner } from '../common/ErrorBanner';
import type { ChartSeries, MarketData } from '../../services/types';

// ── Today view ────────────────────────────────────────────────────────────────

function TodayView({ dataList }: { dataList: MarketData[] }) {
  const ibm = dataList.find((d) => d.quote.ticker === 'IBM');
  const peers = dataList.filter((d) => d.quote.ticker !== 'IBM');

  return (
    <div className="view-today">
      {/* IBM featured card */}
      {ibm && (
        <section className="today-featured" aria-label="IBM spotlight">
          <h2 className="section-title">IBM — Today</h2>
          <CompanyCard data={ibm} window="day" featured />
        </section>
      )}

      {/* Competitor summary grid */}
      {peers.length > 0 && (
        <section className="today-peers" aria-label="Competitor summary">
          <h2 className="section-title">Competitors</h2>
          <div className="cards-grid">
            {peers.map((d) => (
              <CompanyCard key={d.quote.ticker} data={d} window="day" />
            ))}
          </div>
        </section>
      )}

      {/* Performance ranking bar chart */}
      {dataList.length > 0 && (
        <section className="today-ranking" aria-label="Performance ranking">
          <RankingChart dataList={dataList} window="day" />
        </section>
      )}
    </div>
  );
}

// ── 7-Day view ────────────────────────────────────────────────────────────────

function SevenDayView({
  dataList,
  chartSeries,
}: {
  dataList: MarketData[];
  chartSeries: ChartSeries[];
}) {
  return (
    <div className="view-7d">
      {/* Summary cards with day + 7d badges */}
      <section className="view-cards" aria-label="7-day summary">
        <h2 className="section-title">Last 7 Days — Summary</h2>
        <div className="cards-grid">
          {dataList.map((d) => (
            <CompanyCard key={d.quote.ticker} data={d} window="7d" />
          ))}
        </div>
      </section>

      {/* Multi-line price chart */}
      {chartSeries.length > 0 && (
        <section className="view-chart" aria-label="7-day price chart">
          <ComparisonChart series={chartSeries} window="7d" />
        </section>
      )}
    </div>
  );
}

// ── Quarter view ──────────────────────────────────────────────────────────────

function QuarterView({
  dataList,
  chartSeries,
}: {
  dataList: MarketData[];
  chartSeries: ChartSeries[];
}) {
  return (
    <div className="view-quarter">
      {/* Summary cards with day + quarter badges */}
      <section className="view-cards" aria-label="Quarter summary">
        <h2 className="section-title">Last Quarter — Summary</h2>
        <div className="cards-grid">
          {dataList.map((d) => (
            <CompanyCard key={d.quote.ticker} data={d} window="quarter" />
          ))}
        </div>
      </section>

      {/* Area chart for quarter trend */}
      {chartSeries.length > 0 && (
        <section className="view-chart" aria-label="Quarter price chart">
          <ComparisonChart series={chartSeries} window="quarter" />
        </section>
      )}

      {/* Quarter performance ranking */}
      {dataList.length > 0 && (
        <section className="view-ranking" aria-label="Quarter performance ranking">
          <RankingChart dataList={dataList} window="quarter" />
        </section>
      )}
    </div>
  );
}

// ── Root DashboardPage ────────────────────────────────────────────────────────

export function DashboardPage() {
  const { activeWindow, tickers } = useDashboardStore();
  const { dataByTicker, loadingTickers, errorByTicker, isSettled } =
    useMarketData(tickers, activeWindow);

  const errors = Object.entries(errorByTicker);

  // Build ordered list (IBM always first) and chart series
  const dataList: MarketData[] = tickers
    .map((t) => dataByTicker[t])
    .filter((d): d is MarketData => d !== undefined);

  const chartSeries: ChartSeries[] = dataList.map((d) => ({
    ticker: d.quote.ticker,
    name: d.quote.name,
    data: d.history,
  }));

  const isLoading = !isSettled && loadingTickers.length > 0;

  return (
    <div className="dashboard-page">
      {/* Per-ticker error banners — non-fatal */}
      {errors.map(([ticker, err]) => (
        <ErrorBanner key={ticker} ticker={ticker} message={err.message} />
      ))}

      {isLoading ? (
        <LoadingSpinner label={`Loading ${loadingTickers.join(', ')}…`} />
      ) : (
        <>
          {activeWindow === 'day' && (
            <TodayView dataList={dataList} />
          )}
          {activeWindow === '7d' && (
            <SevenDayView dataList={dataList} chartSeries={chartSeries} />
          )}
          {activeWindow === 'quarter' && (
            <QuarterView dataList={dataList} chartSeries={chartSeries} />
          )}
        </>
      )}
    </div>
  );
}

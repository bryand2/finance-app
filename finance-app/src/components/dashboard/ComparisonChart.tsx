import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartSeries, TimeWindow } from '../../services/types';

interface ComparisonChartProps {
  series: ChartSeries[];
  window: TimeWindow;
}

/** One accent color per ticker position — consistent regardless of data order. */
const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

/**
 * Merges per-ticker history arrays into a unified array of objects
 * keyed by date, suitable for Recharts multi-line data.
 */
function mergeSeriesData(
  series: ChartSeries[],
): Record<string, number | string>[] {
  const dateMap = new Map<string, Record<string, number | string>>();

  series.forEach(({ ticker, data }) => {
    data.forEach(({ date, close }) => {
      if (!dateMap.has(date)) dateMap.set(date, { date });
      dateMap.get(date)![ticker] = close;
    });
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

/** Format a date key for the X-axis tick. */
function formatDate(value: string, window: TimeWindow): string {
  if (window === 'day') return value;
  try {
    const d = new Date(value);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export function ComparisonChart({ series, window }: ComparisonChartProps) {
  const data = mergeSeriesData(series);

  if (data.length === 0) {
    return (
      <div className="chart-empty">No historical data available for this window.</div>
    );
  }

  const useArea = window === 'quarter';
  const ChartComponent = useArea ? AreaChart : LineChart;
  const SeriesComponent = useArea ? Area : Line;

  return (
    <div className="comparison-chart">
      <h2 className="chart-title">
        {window === '7d' ? 'Last 7 Days' : 'Last Quarter'} — Price Comparison
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <ChartComponent data={data} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => formatDate(String(v), window)}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            tick={{ fontSize: 11 }}
            width={55}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number' ? [`$${value.toFixed(2)}`, ''] : [String(value), '']
            }
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          {series.map(({ ticker, name }, i) => (
            <SeriesComponent
              key={ticker}
              type="monotone"
              dataKey={ticker}
              name={name}
              stroke={COLORS[i % COLORS.length]}
              fill={useArea ? COLORS[i % COLORS.length] : undefined}
              fillOpacity={useArea ? 0.08 : undefined}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

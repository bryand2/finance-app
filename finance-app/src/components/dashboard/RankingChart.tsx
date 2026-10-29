import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { MarketData, TimeWindow } from '../../services/types';

interface RankingChartProps {
  /** Ordered list of MarketData — IBM first by convention. */
  dataList: MarketData[];
  window: TimeWindow;
}

interface RankRow {
  ticker: string;
  name: string;
  value: number;       // pct change to display
  absValue: number;    // for the bar magnitude (always positive)
  positive: boolean;
}

/** Compute per-ticker % change for today or across the history window. */
function buildRankRows(dataList: MarketData[], window: TimeWindow): RankRow[] {
  return dataList
    .map(({ quote, history }): RankRow | null => {
      let value: number;

      if (window === 'day') {
        value = quote.changePct * 100;
      } else {
        if (history.length < 2) return null;
        const first = history[0].close;
        const last = history[history.length - 1].close;
        if (!first) return null;
        value = ((last - first) / first) * 100;
      }

      return {
        ticker: quote.ticker,
        name: quote.name,
        value: parseFloat(value.toFixed(2)),
        absValue: Math.abs(parseFloat(value.toFixed(2))),
        positive: value >= 0,
      };
    })
    .filter((r): r is RankRow => r !== null)
    .sort((a, b) => b.value - a.value);   // best performer first
}

const COLOR_POSITIVE = '#1a7f37';
const COLOR_NEGATIVE = '#cf222e';

export function RankingChart({ dataList, window }: RankingChartProps) {
  const rows = buildRankRows(dataList, window);

  if (rows.length === 0) return null;

  const title =
    window === 'day'
      ? "Today's Performance Ranking"
      : window === '7d'
        ? '7-Day Performance Ranking'
        : 'Quarter Performance Ranking';

  return (
    <div className="ranking-chart">
      <h3 className="ranking-title">{title}</h3>
      <ResponsiveContainer width="100%" height={rows.length * 52 + 32}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
            tick={{ fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <YAxis
            type="category"
            dataKey="ticker"
            tick={{ fontSize: 12, fontWeight: 600 }}
            width={40}
          />
          <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1} />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number'
                ? [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, 'Change']
                : [String(value), 'Change']
            }
            labelFormatter={(label) => {
              const row = rows.find((r) => r.ticker === label);
              return row ? `${row.ticker} — ${row.name}` : label;
            }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={28}>
            {rows.map((row) => (
              <Cell
                key={row.ticker}
                fill={row.positive ? COLOR_POSITIVE : COLOR_NEGATIVE}
                fillOpacity={row.ticker === 'IBM' ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

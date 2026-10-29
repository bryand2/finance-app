/**
 * Finance API proxy server
 *
 * Wraps yahoo-finance2 so the React front-end never calls Yahoo directly
 * (avoids CORS and keeps the data-shape contract in one place).
 *
 * Endpoints:
 *   GET /api/finance/:ticker/quote
 *   GET /api/finance/:ticker/history?days=N   (N = 1 | 7 | 90)
 *
 * Run with:  npx tsx server/index.ts
 */

import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
});

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Date object for `daysAgo` calendar days before today. */
function daysAgoDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

/** Basic ticker guard — only word characters and dots, 1-10 chars. */
function isValidTicker(ticker: string): boolean {
  return /^[A-Z0-9.]{1,10}$/i.test(ticker);
}

// ── GET /api/finance/:ticker/quote ────────────────────────────────────────────

app.get('/api/finance/:ticker/quote', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  if (!isValidTicker(ticker)) {
    res.status(400).json({ error: `Invalid ticker symbol: ${ticker}` });
    return;
  }

  try {
    // quoteSummary 'price' module returns regularMarketPrice, change, etc.
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['price'],
    });

    const price = result.price;
    if (!price) {
      res.status(404).json({ error: `No quote data found for ${ticker}` });
      return;
    }

    // Return only the fields RawQuote in normalize.ts expects
    res.json({
      symbol: ticker,
      shortName: price.shortName ?? price.longName ?? ticker,
      regularMarketPrice: price.regularMarketPrice,
      regularMarketChange: price.regularMarketChange,
      regularMarketChangePercent: price.regularMarketChangePercent,
      // yahoo-finance2 returns a Date object; convert to Unix seconds
      regularMarketTime:
        price.regularMarketTime instanceof Date
          ? Math.floor(price.regularMarketTime.getTime() / 1000)
          : price.regularMarketTime,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // yahoo-finance2 throws when the symbol is not found
    if (message.toLowerCase().includes('not found') || message.includes('404')) {
      res.status(404).json({ error: `Ticker not found: ${ticker}` });
    } else {
      console.error(`[quote] ${ticker}:`, message);
      res.status(502).json({ error: `Upstream error for ${ticker}: ${message}` });
    }
  }
});

// ── GET /api/finance/:ticker/history?days=N ───────────────────────────────────

app.get('/api/finance/:ticker/history', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const days = parseInt(String(req.query.days ?? '7'), 10);

  if (!isValidTicker(ticker)) {
    res.status(400).json({ error: `Invalid ticker symbol: ${ticker}` });
    return;
  }

  if (isNaN(days) || days < 1 || days > 365) {
    res.status(400).json({ error: `days must be between 1 and 365` });
    return;
  }

  // For a single day, still fetch 5 calendar days so we get at least one trading row
  const fetchDays = days === 1 ? 5 : days;
  const period1 = daysAgoDate(fetchDays);
  const period2 = new Date();

  try {
    const result = await yahooFinance.chart(ticker, {
      period1,
      period2,
      interval: '1d',
    });

    const rows = result?.quotes ?? [];

    if (rows.length === 0) {
      res.status(404).json({ error: `No history found for ${ticker}` });
      return;
    }

    // Return only the fields RawHistoricalItem in normalize.ts expects,
    // sliced to the requested window (most recent `days` trading days).
    const limited = days === 1 ? rows.slice(-1) : rows.slice(-days);
    const payload = limited.map((row) => ({
      date: row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date),
      close: row.close ?? row.adjclose,
    }));

    res.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('not found') || message.includes('404')) {
      res.status(404).json({ error: `Ticker not found: ${ticker}` });
    } else {
      console.error(`[history] ${ticker}:`, message);
      res.status(502).json({ error: `Upstream error for ${ticker}: ${message}` });
    }
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Finance proxy listening on http://localhost:${PORT}`);
});

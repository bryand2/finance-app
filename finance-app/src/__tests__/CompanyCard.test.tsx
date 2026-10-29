import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanyCard } from '../components/dashboard/CompanyCard';
import type { MarketData } from '../services/types';

const IBM_DATA: MarketData = {
  quote: {
    ticker: 'IBM',
    name: 'IBM',
    price: 185.4,
    change: 1.2,
    changePct: 0.65,
    timestamp: Date.now(),
  },
  history: [],
};

const NEGATIVE_DATA: MarketData = {
  quote: {
    ticker: 'MSFT',
    name: 'Microsoft',
    price: 415.2,
    change: -3.5,
    changePct: -0.84,
    timestamp: Date.now(),
  },
  history: [],
};

// MarketData with enough history to show the period badge
const DATA_WITH_HISTORY: MarketData = {
  quote: { ...IBM_DATA.quote },
  history: [
    { date: '2024-03-01', close: 180.0 },
    { date: '2024-03-07', close: 185.4 },
  ],
};

describe('CompanyCard', () => {
  it('renders the ticker symbol', () => {
    render(<CompanyCard data={IBM_DATA} window="day" />);
    const elements = screen.getAllByText('IBM');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the formatted price', () => {
    render(<CompanyCard data={IBM_DATA} window="day" />);
    expect(screen.getByText(/\$185\.40/)).toBeInTheDocument();
  });

  it('shows a positive change indicator for gains', () => {
    render(<CompanyCard data={IBM_DATA} window="day" />);
    const changeEl = screen.getByText(/\+1\.20/);
    expect(changeEl.closest('.card-change')).toHaveClass('change--positive');
  });

  it('shows a negative change indicator for losses', () => {
    render(<CompanyCard data={NEGATIVE_DATA} window="day" />);
    const changeEl = screen.getByText(/-3\.50/);
    expect(changeEl.closest('.card-change')).toHaveClass('change--negative');
  });

  it('shows a period badge for the 7d window when history is available', () => {
    render(<CompanyCard data={DATA_WITH_HISTORY} window="7d" />);
    expect(screen.getByText('7-day')).toBeInTheDocument();
  });

  it('does not show a period badge for the day window', () => {
    render(<CompanyCard data={DATA_WITH_HISTORY} window="day" />);
    expect(screen.queryByText('7-day')).not.toBeInTheDocument();
    expect(screen.queryByText('Quarter')).not.toBeInTheDocument();
  });

  it('applies the featured class when featured prop is true', () => {
    const { container } = render(
      <CompanyCard data={IBM_DATA} window="day" featured />,
    );
    expect(container.firstChild).toHaveClass('company-card--featured');
  });
});

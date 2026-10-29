import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '../components/layout/AppShell';

describe('AppShell', () => {
  it('renders all three time-window tabs', () => {
    render(
      <AppShell activeWindow="day" onWindowChange={() => {}}>
        <div>content</div>
      </AppShell>,
    );
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last Quarter' })).toBeInTheDocument();
  });

  it('marks the active tab with aria-pressed="true"', () => {
    render(
      <AppShell activeWindow="7d" onWindowChange={() => {}}>
        <div />
      </AppShell>,
    );
    const activeTab = screen.getByRole('button', { name: 'Last 7 Days' });
    expect(activeTab).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onWindowChange when a different tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AppShell activeWindow="day" onWindowChange={onChange}>
        <div />
      </AppShell>,
    );
    await user.click(screen.getByRole('button', { name: 'Last 7 Days' }));
    expect(onChange).toHaveBeenCalledWith('7d');
  });

  it('renders children in the main area', () => {
    render(
      <AppShell activeWindow="day" onWindowChange={() => {}}>
        <div data-testid="child">hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

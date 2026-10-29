interface ErrorBannerProps {
  ticker?: string;
  message: string;
}

export function ErrorBanner({ ticker, message }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon" aria-hidden="true">⚠</span>
      {ticker && <strong className="error-ticker">{ticker}:</strong>}
      <span className="error-message">{message}</span>
    </div>
  );
}

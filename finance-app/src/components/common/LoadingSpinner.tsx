interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="spinner-ring" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  );
}

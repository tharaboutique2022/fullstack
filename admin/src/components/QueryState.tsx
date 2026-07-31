import type { ReactNode } from 'react';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function QueryState({
  isLoading,
  isError,
  error,
  children,
  emptyMessage = 'No data found',
  isEmpty = false,
}: QueryStateProps) {
  if (isLoading) {
    return <div className="card muted">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="error-box">
        {error instanceof Error ? error.message : 'Failed to load data'}
      </div>
    );
  }

  if (isEmpty) {
    return <div className="card muted">{emptyMessage}</div>;
  }

  return <>{children}</>;
}

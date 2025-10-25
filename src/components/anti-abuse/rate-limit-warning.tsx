'use client';

import { AlertTriangle } from 'lucide-react';

interface RateLimitWarningProps {
  /** Number of requests made in current window */
  requestCount: number;
  /** Maximum requests allowed */
  maxRequests: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RateLimitWarning Component
 * Displays a warning when approaching or exceeding rate limits
 */
export function RateLimitWarning({
  requestCount,
  maxRequests,
  className = '',
}: RateLimitWarningProps) {
  // Don't show if not close to limit (less than 70%)
  const threshold = Math.floor(maxRequests * 0.7);
  if (requestCount < threshold) {
    return null;
  }

  const remaining = maxRequests - requestCount;
  const isAtLimit = remaining <= 0;
  const isNearLimit = remaining <= 2;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
        isAtLimit
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : isNearLimit
            ? 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400'
            : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      } ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>
        {isAtLimit ? (
          <>
            <strong>Rate-Limit erreicht.</strong> Du hast das Maximum von{' '}
            {maxRequests} Anfragen pro Minute erreicht.
          </>
        ) : (
          <>
            <strong>Achtung:</strong> Nur noch {remaining} Anfrage
            {remaining !== 1 ? 'n' : ''} bis zum Rate-Limit ({requestCount}/
            {maxRequests}).
          </>
        )}
      </p>
    </div>
  );
}


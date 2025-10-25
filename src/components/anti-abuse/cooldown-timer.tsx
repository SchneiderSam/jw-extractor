'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CooldownTimerProps {
  /** Remaining time in milliseconds */
  remainingMs: number;
  /** Callback when timer reaches zero */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CooldownTimer Component
 * Displays a countdown timer with real-time updates for anti-abuse rate limiting
 */
export function CooldownTimer({
  remainingMs,
  onComplete,
  className = '',
}: CooldownTimerProps) {
  const [displayMs, setDisplayMs] = useState(remainingMs);

  useEffect(() => {
    setDisplayMs(remainingMs);
  }, [remainingMs]);

  useEffect(() => {
    if (displayMs <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setDisplayMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          onComplete?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayMs, onComplete]);

  // Don't render if no time remaining
  if (displayMs <= 0) {
    return null;
  }

  const remainingSeconds = Math.ceil(displayMs / 1000);

  return (
    <div
      className={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <Clock className="h-4 w-4 animate-pulse" aria-hidden="true" />
      <span>
        Bitte warte {remainingSeconds} Sekunde{remainingSeconds !== 1 ? 'n' : ''}
        ...
      </span>
    </div>
  );
}


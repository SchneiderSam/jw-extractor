import type { ExtractionStage } from '@/lib/types';

/**
 * Simple logging utility for extraction debugging
 * Only logs in development environment
 */

interface LogContext {
  url?: string;
  attempt?: number;
  stage?: ExtractionStage;
  timing?: number;
  selector?: string;
  duration?: number;
  error?: unknown;
  errorType?: string;
  [key: string]: string | number | unknown | undefined;
}

class ExtractionLogger {
  private timers: Map<string, number> = new Map();
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      console.log(`[Extraction:INFO] ${message}${contextStr}`);
    }
  }

  /**
   * Log error message (always logs, even in production)
   */
  error(message: string, context?: LogContext): void {
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    console.error(`[Extraction:ERROR] ${message}${contextStr}`);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      console.warn(`[Extraction:WARN] ${message}${contextStr}`);
    }
  }

  /**
   * Start timing a stage
   */
  timeStart(stage: string): void {
    if (this.isDevelopment) {
      this.timers.set(stage, Date.now());
      console.log(`[Extraction:TIMING] ${stage} started`);
    }
  }

  /**
   * End timing a stage and log duration
   */
  timeEnd(stage: string): number {
    const duration = this.getTimerDuration(stage);
    
    if (this.isDevelopment && duration !== null) {
      console.log(`[Extraction:TIMING] ${stage} completed in ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
      this.timers.delete(stage);
    }
    
    return duration || 0;
  }

  /**
   * Get duration for a timer without logging
   */
  getTimerDuration(stage: string): number | null {
    const startTime = this.timers.get(stage);
    if (startTime === undefined) return null;
    return Date.now() - startTime;
  }

  /**
   * Log retry attempt (always logs for user feedback)
   */
  logRetry(attempt: number, maxAttempts: number, delay?: number): void {
    const delayMsg = delay ? ` (waiting ${(delay / 1000).toFixed(1)}s)` : '';
    console.log(`[Extraction] Retrying... (attempt ${attempt} of ${maxAttempts})${delayMsg}`);
  }

  /**
   * Log extraction start
   */
  logExtractionStart(url: string): void {
    if (this.isDevelopment) {
      console.log(`[Extraction] Starting extraction for: ${url}`);
    }
  }

  /**
   * Log extraction success
   */
  logExtractionSuccess(url: string, totalDuration: number): void {
    if (this.isDevelopment) {
      console.log(`[Extraction] ✅ Success for ${url} (${(totalDuration / 1000).toFixed(2)}s)`);
    }
  }

  /**
   * Log extraction failure
   */
  logExtractionFailure(url: string, errorType: string, totalDuration?: number): void {
    const durationMsg = totalDuration ? ` after ${(totalDuration / 1000).toFixed(2)}s` : '';
    console.error(`[Extraction] ❌ Failed for ${url}: ${errorType}${durationMsg}`);
  }

  /**
   * Clear all timers
   */
  clearTimers(): void {
    this.timers.clear();
  }
}

// Export singleton instance
export const logger = new ExtractionLogger();


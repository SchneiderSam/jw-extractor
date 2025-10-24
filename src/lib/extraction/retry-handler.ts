import type { ErrorType, ExtractionResult } from '@/lib/types';
import { logger } from './logger';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxAttempts: number;
  delays: number[]; // Delay in milliseconds for each retry attempt
  retryableErrors: ErrorType[];
}

/**
 * Default retry configuration
 * - 3 total attempts (1 initial + 2 retries)
 * - Exponential backoff: 1s, 2s, 4s
 * - Only retry transient errors
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000], // 1s, 2s, 4s
  retryableErrors: ['FETCH_ERROR', 'TIMEOUT_ERROR', 'PARSE_ERROR'],
};

/**
 * Check if an error type is retryable
 */
function isRetryableError(errorType: ErrorType, config: RetryConfig): boolean {
  return config.retryableErrors.includes(errorType);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper function with exponential backoff
 * 
 * @param operation - Async function that returns ExtractionResult
 * @param config - Retry configuration (optional, uses defaults)
 * @returns Promise resolving to ExtractionResult
 * 
 * @example
 * ```typescript
 * const result = await withRetry(async () => {
 *   return await extractContent(url);
 * });
 * ```
 */
export async function withRetry(
  operation: (attemptNumber: number) => Promise<ExtractionResult>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<ExtractionResult> {
  let lastResult: ExtractionResult | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Execute the operation with current attempt number
      const result = await operation(attempt);

      // If successful, return immediately
      if (result.success) {
        if (attempt > 1) {
          logger.info(`Extraction succeeded on attempt ${attempt}`, { attempt });
        }
        return result;
      }

      // If operation returned an error (not thrown), check if retryable
      if (result.error) {
        lastResult = result;

        // Check if error is retryable
        const shouldRetry = isRetryableError(result.error.type, config);
        const isLastAttempt = attempt >= config.maxAttempts;

        if (!shouldRetry) {
          logger.warn(`Non-retryable error: ${result.error.type}`, {
            errorType: result.error.type,
            attempt,
          });
          return result; // Don't retry permanent errors
        }

        if (isLastAttempt) {
          logger.error(`Max attempts reached (${config.maxAttempts})`, {
            errorType: result.error.type,
            attempt,
          });
          return result; // Return last error after max attempts
        }

        // Calculate delay for next retry
        const delay = config.delays[attempt - 1] || config.delays[config.delays.length - 1];

        // Log retry attempt
        logger.logRetry(attempt + 1, config.maxAttempts, delay);

        // Wait before retrying
        await sleep(delay);
      }
    } catch (error) {
      // Handle unexpected thrown errors
      logger.error('Unexpected error during extraction', { attempt, error });

      // If it's the last attempt, return a generic error
      if (attempt >= config.maxAttempts) {
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: 'An unexpected error occurred after multiple attempts.',
            attemptNumber: attempt,
          },
        };
      }

      // Otherwise, retry
      const delay = config.delays[attempt - 1] || config.delays[config.delays.length - 1];
      logger.logRetry(attempt + 1, config.maxAttempts, delay);
      await sleep(delay);
    }
  }

  // Fallback: return last result or generic error
  return (
    lastResult || {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: 'Extraction failed after multiple attempts.',
        attemptNumber: config.maxAttempts,
      },
    }
  );
}

/**
 * Create a custom retry configuration
 * 
 * @example
 * ```typescript
 * const customConfig = createRetryConfig({
 *   maxAttempts: 5,
 *   delays: [500, 1000, 2000, 4000, 8000],
 * });
 * ```
 */
export function createRetryConfig(
  overrides: Partial<RetryConfig>
): RetryConfig {
  return {
    ...DEFAULT_RETRY_CONFIG,
    ...overrides,
  };
}


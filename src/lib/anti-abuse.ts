/**
 * Anti-Abuse Protection System
 * Client-side protection against spam and excessive requests
 * Uses localStorage for persistence and requires no external APIs
 */

/**
 * Interface for tracking rate limit state in localStorage
 */
export interface RateLimitState {
  /** Array of timestamps (ms) representing recent requests */
  requests: number[];
  /** Timestamp (ms) of the most recent request */
  lastRequest: number;
}

/**
 * Interface for rate limit check results
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Milliseconds remaining until next request is allowed (if blocked) */
  remainingTime?: number;
  /** Number of requests made in current time window */
  requestCount?: number;
}

/**
 * Interface for bot detection results
 */
export interface BotDetectionResult {
  /** Whether bot behavior was detected */
  isBot: boolean;
  /** Reason for bot detection (if detected) */
  reason?: string;
}

/**
 * Anti-Abuse Protection Class
 * Provides static methods for client-side abuse prevention
 */
export class AntiAbuseProtection {
  // ============================================================
  // Constants
  // ============================================================

  /** localStorage key for storing rate limit state */
  private static readonly RATE_LIMIT_KEY = 'jw_extractor_rate_limit';

  /** Maximum number of requests allowed per time window */
  private static readonly MAX_REQUESTS = 10;

  /** Time window for rate limiting in milliseconds (1 minute) */
  private static readonly TIME_WINDOW = 60000;

  /** Minimum delay between consecutive requests in milliseconds (2.5 seconds) */
  private static readonly MIN_REQUEST_DELAY = 2500;

  /** Minimum time user must spend on page before submitting (1 second) */
  private static readonly MIN_FORM_INTERACTION_TIME = 1000;

  // ============================================================
  // Rate Limiting Methods
  // ============================================================

  /**
   * Check if a request is allowed based on rate limiting rules
   * Enforces MAX_REQUESTS per TIME_WINDOW and MIN_REQUEST_DELAY between requests
   * 
   * @returns RateLimitResult indicating if request is allowed and remaining time if blocked
   */
  static checkRateLimit(): RateLimitResult {
    // If localStorage is unavailable, allow the request (graceful degradation)
    if (!this.isLocalStorageAvailable()) {
      return { allowed: true, requestCount: 0 };
    }

    const now = this.now();
    const state = this.getRateLimitState();

    // Clean up expired entries (older than TIME_WINDOW)
    const validRequests = state.requests.filter(
      (timestamp) => now - timestamp < this.TIME_WINDOW
    );

    // Check 1: Maximum requests per time window
    if (validRequests.length >= this.MAX_REQUESTS) {
      // Calculate when the oldest request will expire
      const oldestRequest = validRequests[0];
      const remainingTime = this.TIME_WINDOW - (now - oldestRequest);

      return {
        allowed: false,
        remainingTime: Math.max(0, remainingTime),
        requestCount: validRequests.length,
      };
    }

    // Check 2: Minimum delay between consecutive requests
    if (state.lastRequest > 0) {
      const timeSinceLastRequest = now - state.lastRequest;
      if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
        const remainingTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;

        return {
          allowed: false,
          remainingTime: Math.max(0, remainingTime),
          requestCount: validRequests.length,
        };
      }
    }

    // All checks passed - request is allowed
    return {
      allowed: true,
      requestCount: validRequests.length,
    };
  }

  /**
   * Record a successful request for rate limiting tracking
   * Updates localStorage with new request timestamp
   */
  static recordRequest(): void {
    // If localStorage is unavailable, silently skip (graceful degradation)
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    const now = this.now();
    const state = this.getRateLimitState();

    // Add current timestamp to requests array
    state.requests.push(now);

    // Update last request timestamp
    state.lastRequest = now;

    // Clean up expired entries before saving
    state.requests = state.requests.filter(
      (timestamp) => now - timestamp < this.TIME_WINDOW
    );

    // Save updated state to localStorage
    this.saveRateLimitState(state);
  }

  /**
   * Get rate limit state from localStorage
   * Returns default state if not found or corrupted
   * 
   * @returns Current rate limit state
   * @private
   */
  private static getRateLimitState(): RateLimitState {
    try {
      const stored = localStorage.getItem(this.RATE_LIMIT_KEY);
      if (!stored) {
        return { requests: [], lastRequest: 0 };
      }

      const parsed = JSON.parse(stored) as RateLimitState;

      // Validate structure
      if (
        !parsed ||
        !Array.isArray(parsed.requests) ||
        typeof parsed.lastRequest !== 'number'
      ) {
        return { requests: [], lastRequest: 0 };
      }

      return parsed;
    } catch (error) {
      // If parsing fails, return default state
      return { requests: [], lastRequest: 0 };
    }
  }

  /**
   * Save rate limit state to localStorage
   * 
   * @param state - State to save
   * @private
   */
  private static saveRateLimitState(state: RateLimitState): void {
    try {
      localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(state));
    } catch (error) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to save rate limit state:', error);
    }
  }

  /**
   * Get remaining time until next request is allowed
   * 
   * @returns Milliseconds until next request, or 0 if request can be made immediately
   */
  static getRemainingDelay(): number {
    // TODO: Implement in subtask 51.4
    throw new Error('Not implemented: getRemainingDelay will be implemented in subtask 51.4');
  }

  // ============================================================
  // Bot Detection Methods
  // ============================================================

  /**
   * Detect potential bot behavior through various client-side checks
   * 
   * @param honeypotValue - Value of the honeypot field (should be empty for humans)
   * @returns BotDetectionResult indicating if bot was detected and why
   */
  static detectBot(honeypotValue: string): BotDetectionResult {
    // TODO: Implement in subtask 51.3
    throw new Error('Not implemented: detectBot will be implemented in subtask 51.3');
  }

  /**
   * Validate form submission timing
   * Rejects submissions that are too fast (likely automated)
   * 
   * @param startTime - Timestamp when form/page was loaded
   * @returns true if timing is valid, false if submission was too fast
   */
  static validateFormTiming(startTime: number): boolean {
    // TODO: Implement in subtask 51.3
    throw new Error('Not implemented: validateFormTiming will be implemented in subtask 51.3');
  }

  /**
   * Check if JavaScript environment appears legitimate
   * Validates presence of expected browser objects
   * 
   * @returns true if environment seems legitimate, false if suspicious
   */
  static validateEnvironment(): boolean {
    // TODO: Implement in subtask 51.3
    throw new Error('Not implemented: validateEnvironment will be implemented in subtask 51.3');
  }

  /**
   * Check user agent for common bot patterns
   * 
   * @returns true if user agent appears legitimate, false if suspicious
   */
  static validateUserAgent(): boolean {
    // TODO: Implement in subtask 51.3
    throw new Error('Not implemented: validateUserAgent will be implemented in subtask 51.3');
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Check if localStorage is available and working
   * Handles cases where localStorage is disabled or unavailable
   * 
   * @returns true if localStorage is available, false otherwise
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear all anti-abuse protection data from localStorage
   * Useful for testing or manual resets
   */
  static clearProtectionData(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.RATE_LIMIT_KEY);
    }
  }

  /**
   * Get current timestamp in milliseconds
   * Utility method for consistent time handling
   * 
   * @returns Current timestamp in milliseconds
   */
  static now(): number {
    return Date.now();
  }
}


/**
 * Simple rate limiting utility
 * Just enforces a minimum delay between API calls
 */

export interface RateLimiterConfig {
  minInterval: number; // Minimum milliseconds between calls
}

/**
 * Simple rate limiter - just waits between calls
 */
export class RateLimiter {
  private lastCall = 0;
  private readonly minInterval: number;

  constructor(config: RateLimiterConfig) {
    this.minInterval = config.minInterval;
  }

  /**
   * Wait if needed to respect minimum interval
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    // Update lastCall immediately to prevent race conditions
    this.lastCall =
      now +
      (timeSinceLastCall < this.minInterval
        ? this.minInterval - timeSinceLastCall
        : 0);

    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Factory function to create rate limiter
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Basic rate limit config - 500ms between calls
 */
export const BasicRateLimit = { minInterval: 500 };

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

    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      // Reserve the completion time immediately to prevent race conditions
      this.lastCall = now + waitTime;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } else {
      // No wait needed, just update to current time
      this.lastCall = now;
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

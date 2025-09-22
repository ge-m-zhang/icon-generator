import { RateLimiter, createRateLimiter, BasicRateLimit } from '../rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('constructor', () => {
    it('should create rate limiter with correct config', () => {
      const config = { minInterval: 1000 }
      const rateLimiter = new RateLimiter(config)
      
      expect(rateLimiter).toBeInstanceOf(RateLimiter)
    })
  })

  describe('wait', () => {
    it('should not wait on first call', async () => {
      const rateLimiter = new RateLimiter({ minInterval: 500 })
      
      const startTime = Date.now()
      await rateLimiter.wait()
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Should be nearly instant
    })

    it('should wait minimum interval between calls', async () => {
      const rateLimiter = new RateLimiter({ minInterval: 500 })
      
      // First call
      await rateLimiter.wait()
      
      // Simulate some time passing (less than minimum interval)
      jest.advanceTimersByTime(200)
      
      // Second call should wait for remaining time
      const waitPromise = rateLimiter.wait()
      
      // Should not resolve immediately
      jest.advanceTimersByTime(100)
      expect(waitPromise).not.toHaveReturned
      
      // Should resolve after remaining time
      jest.advanceTimersByTime(200)
      await waitPromise
    })

    it('should not wait if enough time has passed', async () => {
      const rateLimiter = new RateLimiter({ minInterval: 500 })
      
      // First call
      await rateLimiter.wait()
      
      // Advance time beyond minimum interval
      jest.advanceTimersByTime(600)
      
      // Second call should not wait
      const startTime = Date.now()
      await rateLimiter.wait()
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('factory functions', () => {
    it('should create rate limiter via factory', () => {
      const config = { minInterval: 1000 }
      const rateLimiter = createRateLimiter(config)
      
      expect(rateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should provide basic rate limit config', () => {
      expect(BasicRateLimit).toEqual({ minInterval: 500 })
    })
  })
})

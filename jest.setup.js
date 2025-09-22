import '@testing-library/jest-dom'

// Polyfill for setImmediate (required by Winston)
if (!global.setImmediate) {
  global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args)
}
if (!global.clearImmediate) {
  global.clearImmediate = (id) => clearTimeout(id)
}

// Mock environment variables for tests
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.REPLICATE_API_TOKEN = 'test-replicate-token'
process.env.NODE_ENV = 'test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock fetch
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

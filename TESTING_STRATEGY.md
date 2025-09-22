# Testing Strategy

## Current Status

✅ **3 test suites working** (32 tests passing)  
⚠️ **16% coverage** (target: 70%)  
✅ **Framework configured** (Jest + React Testing Library)

## What's Tested

- ✅ `rate-limiter` - Timing and multiple calls
- ✅ `icon-generation` - Core business logic with OpenAI mocking
- ✅ `PromptInput` - Form validation and user interactions

## Priority: Missing Tests (0% coverage)

**Immediate:**

1. **StyleSelector** - Style selection, disabled states
2. **useIconGeneration hook** - React Query integration
3. **API routes** (`route.ts`) - Request/response with mocked services
4. **GenerateButton** - Loading states, click handling
5. **IconGeneratorForm** - Form submission workflow

**Soon:** 6. **IconGrid/IconItem** - Display components 7. **API clients** - Error handling, response parsing  
8. **File utilities** - Download functionality

## Test Patterns

```tsx
// Component test
import { render, screen } from "@/lib/test-utils";
test("renders correctly", () => {
  render(<Component />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});

// Service test with mocking
jest.mock("openai");
test("handles API failure", async () => {
  mockOpenAI.mockRejectedValue(new Error("API Error"));
  const result = await service.call();
  expect(result).toBe(fallbackValue);
});
```

## Coverage Goals

- **70% overall** (current: 16%)
- **Focus on business logic** (services, forms)
- **Critical user paths** (generate icons workflow)

## Mock Strategy

- External APIs (OpenAI, Replicate)
- File operations
- React Query providers
- Next.js components (already configured)

That's it. Everything else is configured and working.

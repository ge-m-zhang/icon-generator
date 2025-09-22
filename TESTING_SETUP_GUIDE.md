# Testing Quick Start

## Run Tests

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode (development)
pnpm test:coverage     # With coverage report
```

## Current Status

**3 test suites working** (32 tests passing):

- `rate-limiter.test.ts` - Utility timing tests
- `PromptInput.test.tsx` - Form validation tests
- `icon-generation.test.ts` - Core service tests

**Coverage**: 16% (target: 70%)

## Writing Tests

**Component test example:**

```tsx
import { render, screen } from "@/lib/test-utils";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

**Service test example:**

```ts
import { myService } from "../my-service";

describe("myService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should work", async () => {
    const result = await myService.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Quick Debug

```bash
pnpm test MyComponent.test.tsx    # Single file
pnpm test --verbose               # Detailed output
```

## Next: Add tests for

1. `StyleSelector` component
2. `useIconGeneration` hook
3. API routes (`route.ts`)
4. File utilities

Everything else is configured and ready to go!

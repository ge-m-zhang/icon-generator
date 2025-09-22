import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new query client for each test to avoid cross-test pollution
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        staleTime: Infinity, // Don't refetch during tests
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock generators for test data
export const mockIconGenerationRequest = {
  prompt: "test prompt",
  style: "Business" as const,
  colors: ["blue", "white"],
};

export const mockIconGenerationResponse = {
  success: true,
  images: [
    {
      id: "test-icon-1",
      item: "calculator",
      url: "https://example.com/calculator.png",
      downloadUrl: "https://example.com/calculator.png",
      style: "Business",
      originalPrompt: "office supplies",
    },
    {
      id: "test-icon-2",
      item: "pen",
      url: "https://example.com/pen.png",
      downloadUrl: "https://example.com/pen.png",
      style: "Business",
      originalPrompt: "office supplies",
    },
  ],
  metadata: {
    originalPrompt: "office supplies",
    style: "Business",
    generatedItems: ["calculator", "pen"],
  },
};

export const mockApiError = {
  message: "Test API error",
  status: 400,
  code: "TEST_ERROR",
};

// Helper to create mock fetch responses
export const mockFetchResponse = (data: unknown, ok = true, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
    headers: new Headers(),
  });
};

// Helper to create mock fetch error
export const mockFetchError = (error: Error) => {
  global.fetch = jest.fn().mockRejectedValue(error);
};

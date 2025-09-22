/**
 * Utilities for Flux Schnell client
 */

import {
  FluxSchnellInput,
  FluxError,
  FluxErrorCode,
} from "../../types/flux-schnell-types";

// Async utilities
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Input validation
export const validateInput = (input: FluxSchnellInput): void => {
  if (!input.prompt?.trim()) {
    throw new Error("Prompt is required and cannot be empty");
  }

  if (
    input.num_inference_steps &&
    (input.num_inference_steps < 1 || input.num_inference_steps > 12)
  ) {
    throw new Error("num_inference_steps must be between 1 and 12");
  }

  if (input.width && input.width <= 0) {
    throw new Error("Width must be greater than 0");
  }

  if (input.height && input.height <= 0) {
    throw new Error("Height must be greater than 0");
  }
};

// Error handling
export const createFluxError = (
  error: unknown,
  requestId?: string
): FluxError => {
  const message = error instanceof Error ? error.message : String(error);
  let code = FluxErrorCode.UNKNOWN_ERROR;

  if (message.includes("authentication")) {
    code = FluxErrorCode.AUTHENTICATION_ERROR;
  } else if (message.includes("rate limit")) {
    code = FluxErrorCode.RATE_LIMIT_EXCEEDED;
  } else if (message.includes("invalid")) {
    code = FluxErrorCode.INVALID_INPUT;
  } else if (message.includes("timeout")) {
    code = FluxErrorCode.POLLING_TIMEOUT;
  } else if (message.includes("network")) {
    code = FluxErrorCode.NETWORK_ERROR;
  }

  return new FluxError(message, code, requestId, undefined, error);
};

// Output processing
export const extractImageUrls = (output: unknown[]): string[] => {
  if (!Array.isArray(output) || !output.length) return [];

  return output.map((item, index) => {
    if (typeof item === "string") return item;

    if (item && typeof item === "object" && "url" in item) {
      const urlItem = item as { url: unknown };
      if (typeof urlItem.url === "string") return urlItem.url;
    }

    throw new Error(
      `Unexpected output format at index ${index}: ${typeof item}`
    );
  });
};

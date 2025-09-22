/**
 * Utilities for Flux Schnell client
 */

import {
  FluxSchnellInput,
  FluxError,
  FluxErrorCode,
} from "../../types/flux-schnell-types";
import logger from "../../config/logger";

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

  const urls: string[] = [];

  for (let index = 0; index < output.length; index++) {
    const item = output[index];
    
    try {
      if (typeof item === "string") {
        urls.push(item);
        continue;
      }

      if (item && typeof item === "object") {
        const objItem = item as Record<string, unknown>;
        
        // Try different possible URL properties that Replicate might use
        const possibleUrlProps = ['url', 'image_url', 'download_url', 'output_url'];
        
        let foundUrl = false;
        for (const prop of possibleUrlProps) {
          if (prop in objItem && typeof objItem[prop] === "string") {
            urls.push(objItem[prop] as string);
            foundUrl = true;
            break;
          }
        }
        
        if (foundUrl) continue;
        
        // If object has a direct URL-like property, try to extract it
        for (const [, value] of Object.entries(objItem)) {
          if (typeof value === "string" && (
            value.startsWith("http://") || 
            value.startsWith("https://") ||
            value.startsWith("data:")
          )) {
            urls.push(value);
            foundUrl = true;
            break;
          }
        }
        
        if (foundUrl) continue;

        // Log the actual object structure for debugging
        logger.error(`Unable to extract URL from object at index ${index}`, {
          objectStructure: objItem,
          objectKeys: Object.keys(objItem),
          index
        });
        
        // Don't throw - let the calling code handle the empty array
        continue;
      }

      logger.error(`Unexpected output format at index ${index}: ${typeof item}`, {
        item: String(item),
        index
      });
      
    } catch (error) {
      logger.error(`Error processing output item at index ${index}`, {
        error: error instanceof Error ? error.message : String(error),
        item: String(item),
        index
      });
    }
  }

  return urls;
};

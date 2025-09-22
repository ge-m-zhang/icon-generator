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
  if (!Array.isArray(output) || !output.length) {
    logger.debug("extractImageUrls: No output array or empty array", { output });
    return [];
  }

  logger.debug("extractImageUrls: Processing output", {
    outputLength: output.length,
    outputType: typeof output,
    isArray: Array.isArray(output),
    rawOutput: JSON.stringify(output, null, 2)
  });

  const urls: string[] = [];

  for (let index = 0; index < output.length; index++) {
    const item = output[index];

    logger.debug(`Processing output item at index ${index}`, {
      itemType: typeof item,
      itemIsArray: Array.isArray(item),
      itemConstructor: item?.constructor?.name,
      itemValue: String(item),
      index
    });

    try {
      // First, check if it's a string (expected format)
      if (typeof item === "string" && item.trim().length > 0) {
        logger.debug(`Found string URL at index ${index}`, { url: item });
        urls.push(item);
        continue;
      }

      // Check if it's null, undefined, or empty
      if (!item || item === null || item === undefined) {
        logger.debug(`Skipping null/undefined item at index ${index}`);
        continue;
      }

      // If we reach here, it's not a string, which is unexpected based on the API docs
      // But this is actually common - Replicate JS client returns File objects
      logger.debug(`Processing object response at index ${index}`, {
        itemType: typeof item,
        isFile: item instanceof File,
        isFileObject: item && typeof item === "object" && "type" in item && "size" in item,
        hasUrl: item && typeof item === "object" && "url" in item,
        index
      });

      // Handle object responses (File objects, response objects, etc.)
      if (item && typeof item === "object") {
        const objItem = item as Record<string, unknown>;

        // Method 1: Check if it's a FileOutput object (Replicate's custom class)
        if (item.constructor?.name === 'FileOutput') {
          logger.debug(`Found FileOutput object at index ${index}`);

          // FileOutput objects have a toString() method that returns the URL
          try {
            const stringValue = String(item);
            if (stringValue && stringValue !== '[object Object]' && (
              stringValue.startsWith('http://') ||
              stringValue.startsWith('https://') ||
              stringValue.includes('replicate')
            )) {
              logger.debug(`FileOutput toString() returned URL at index ${index}`, { url: stringValue });
              urls.push(stringValue);
              continue;
            }
          } catch (error) {
            logger.debug(`Failed to extract URL from FileOutput at index ${index}`, { error });
          }
        }

        // Method 2: Check if it's a File object and try to get its URL
        if (item instanceof File) {
          logger.debug(`Found File object at index ${index}`, { fileName: item.name, fileSize: item.size, fileType: item.type });

          // Create a blob URL for the File
          try {
            const url = URL.createObjectURL(item);
            logger.debug(`Created blob URL for File at index ${index}`, { url });
            urls.push(url);
            continue;
          } catch (error) {
            logger.error(`Failed to create blob URL for File at index ${index}`, { error });
          }
        }

        // Method 2: Check if it has file-like properties but isn't a File instance
        if ('type' in objItem && 'size' in objItem && !(item instanceof File)) {
          logger.debug(`Found file-like object at index ${index}`, { type: objItem.type, size: objItem.size });

          // Try to create object URL if it has the stream/arrayBuffer methods
          if ('stream' in objItem && typeof objItem.stream === 'function') {
            try {
              const url = URL.createObjectURL(item as Blob);
              logger.debug(`Created blob URL for file-like object at index ${index}`, { url });
              urls.push(url);
              continue;
            } catch (error) {
              logger.debug(`Failed to create blob URL for file-like object at index ${index}`, { error });
            }
          }
        }

        // Method 3: Direct URL properties
        const urlProps = ['url', 'href', 'src', 'link', 'path', 'uri'];
        let foundUrl = false;
        for (const prop of urlProps) {
          if (prop in objItem && typeof objItem[prop] === "string" && objItem[prop]) {
            const url = objItem[prop] as string;
            logger.debug(`Found URL in '${prop}' property at index ${index}`, { url });
            urls.push(url);
            foundUrl = true;
            break;
          }
        }

        if (foundUrl) continue;

        // Method 4: Check all properties for URL-like strings
        for (const [key, value] of Object.entries(objItem)) {
          if (typeof value === "string" && (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("data:") ||
            value.includes("replicate.com") ||
            value.includes("replicate.delivery")
          )) {
            logger.debug(`Found URL-like string in '${key}' at index ${index}`, { url: value });
            urls.push(value);
            foundUrl = true;
            break;
          }
        }

        if (!foundUrl) {
          logger.error(`Could not extract URL from object at index ${index}`, {
            objectKeys: Object.keys(objItem),
            constructorName: item.constructor?.name,
            isFile: item instanceof File,
            hasType: 'type' in objItem,
            hasSize: 'size' in objItem,
            hasStream: 'stream' in objItem,
            index
          });
        }
      }

    } catch (error) {
      logger.error(`Error processing output item at index ${index}`, {
        error: error instanceof Error ? error.message : String(error),
        item: String(item).substring(0, 200),
        index
      });
    }
  }

  logger.debug("extractImageUrls: Final result", {
    foundUrls: urls.length,
    urls: urls.map(url => url.substring(0, 100))
  });

  return urls;
};

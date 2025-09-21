/**
 * Simple Flux Schnell client for icon generation
 */

import Replicate from "replicate";
import { v4 as uuidv4 } from "uuid";
import {
  FluxSchnellClientConfig,
  FluxGenerationRequest,
  FluxGenerationResult,
} from "../../types/flux-schnell-types";
import {
  validateInput,
  createFluxError,
  extractImageUrls,
  sleep,
} from "./flux-schnell-utils";
import { env } from "../../config/environment";

export class FluxSchnellClient {
  private static readonly MODEL_NAME = "black-forest-labs/flux-schnell";
  private static readonly COST_PER_IMAGE = 0.003;

  private readonly replicate: Replicate;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private totalCost = 0;
  private totalImages = 0;

  constructor(config: FluxSchnellClientConfig) {
    this.replicate = new Replicate({ 
      auth: config.apiToken,
      fetch: (url, init) => {
        return fetch(url, {
          ...init,
          signal: AbortSignal.timeout(config.timeout ?? env.REPLICATE_API_TIMEOUT)
        });
      }
    });
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? env.REPLICATE_API_TIMEOUT;
  }

  generateImages = async (
    request: FluxGenerationRequest
  ): Promise<FluxGenerationResult> => {
    const requestId = request.requestId || uuidv4();
    const startTime = Date.now();

    try {
      validateInput(request);

      const output = await this.runFluxWithRetry(request);
      const imageUrls = extractImageUrls(output);

      if (!imageUrls.length) {
        throw new Error("No images generated");
      }

      const cost = imageUrls.length * FluxSchnellClient.COST_PER_IMAGE;

      // Update simple cost tracking
      this.totalCost += cost;
      this.totalImages += imageUrls.length;

      return {
        requestId,
        predictionId: requestId,
        imageUrls,
        cost,
        generationTime: Date.now() - startTime,
        input: request,
        metrics: {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw createFluxError(error, requestId);
    }
  };

  getCostTracker = () => ({
    totalImagesGenerated: this.totalImages,
    totalCost: this.totalCost,
    costPerImage: FluxSchnellClient.COST_PER_IMAGE,
    generationHistory: [], // Simplified - no detailed history
  });

  private runFluxWithRetry = async (
    input: FluxGenerationRequest
  ): Promise<unknown[]> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const output = await this.replicate.run(FluxSchnellClient.MODEL_NAME, {
          input: {
            prompt: input.prompt,
            go_fast: input.go_fast ?? true,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: input.aspect_ratio || "1:1",
            output_format: input.output_format || "webp",
            output_quality: 80,
            num_inference_steps: input.num_inference_steps || 4,
            ...(input.seed && { seed: input.seed }),
          },
        });

        return Array.isArray(output) ? output : [output];
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors
        if (
          error instanceof Error &&
          error.message.includes("authentication")
        ) {
          break;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }

    throw lastError;
  };
}

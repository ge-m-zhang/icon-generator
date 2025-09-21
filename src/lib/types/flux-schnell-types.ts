/**
 * Types for Flux Schnell client - simplified and SDK-compatible
 */

// Minimal base prediction interface matching Replicate SDK
export interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: Record<string, unknown>;
  output?: unknown;
  error?: string | null;
  logs?: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  urls: {
    get: string;
    cancel: string;
    stream?: string;
  };
  metrics?: {
    predict_time?: number;
    total_time?: number;
  };
}

// Only define Flux-specific input schema (model-specific)
export interface FluxSchnellInput extends Record<string, unknown> {
  prompt: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  num_inference_steps?: number;
  seed?: number;
  output_format?: "png" | "webp" | "jpg";
  go_fast?: boolean;
}

// Flux-specific prediction type (extends base type with proper input)
export interface FluxPrediction extends ReplicatePrediction {
  input: FluxSchnellInput;
  output?: string[] | null; // flux-schnell returns array of image URLs
}

// Simplified client config
export interface FluxSchnellClientConfig {
  apiToken: string;
  timeout?: number;
  maxPollingTimeout?: number;
  pollingInterval?: number;
  rateLimit?: number;
  maxRetries?: number;
  baseRetryDelay?: number;
  enableLogging?: boolean;
}

// Application-specific types (not in SDK)
export interface FluxGenerationRequest extends FluxSchnellInput {
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface FluxGenerationResult {
  requestId: string;
  predictionId: string;
  imageUrls: string[];
  cost: number;
  generationTime: number;
  input: FluxSchnellInput;
  metrics?: { predict_time?: number; total_time?: number };
  timestamp: string;
}

// Simplified error handling
export class FluxError extends Error {
  constructor(
    message: string,
    public readonly code: FluxErrorCode,
    public readonly requestId?: string,
    public readonly predictionId?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "FluxError";
  }
}

export enum FluxErrorCode {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_INPUT = "INVALID_INPUT",
  GENERATION_FAILED = "GENERATION_FAILED",
  POLLING_TIMEOUT = "POLLING_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Utility types
export interface RateLimitInfo {
  currentRequests: number;
  maxRequests: number;
  resetTime: number;
  isExceeded: boolean;
}

export interface CostTracker {
  totalImagesGenerated: number;
  totalCost: number;
  costPerImage: number;
  generationHistory: {
    timestamp: string;
    requestId: string;
    imageCount: number;
    cost: number;
  }[];
}

export interface LogContext {
  requestId: string;
  predictionId?: string;
  operation: "create" | "poll" | "complete" | "error";
  timing?: { startTime: number; duration?: number };
  metadata?: Record<string, unknown>;
}

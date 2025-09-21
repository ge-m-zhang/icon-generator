// Import and re-export style types
export type { PresetStyleId, StylePreset } from "./style-presets";

// Import constants and utilities from their proper locations
export { STYLE_PRESETS } from "../constants/style-presets";
export { paletteHint } from "../utils";

// Import for internal use
import type { PresetStyleId } from "./style-presets";

// Core data types
export interface IconGenerationRequest {
  prompt: string;
  style: PresetStyleId;
  colors?: string[];
}

export interface GeneratedIcon {
  id: string;
  item: string;
  url: string;
  downloadUrl: string;
  style: string;
  originalPrompt?: string;
}

export interface IconGenerationResponse {
  success: boolean;
  images: GeneratedIcon[];
  metadata?: {
    originalPrompt: string;
    style: string;
    generatedItems?: string[];
  };
  error?: string;
}

// Unsplash prototype types
export interface UnsplashImageResponse {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  description: string | null;
}

export interface StyleTemplate {
  name: string;
  description: string;
  keywordStrategy: string;
}

// UI State
export interface IconGeneratorState {
  loading: boolean;
  error: string | null;
  images: GeneratedIcon[];
  currentRequest?: IconGenerationRequest;
}

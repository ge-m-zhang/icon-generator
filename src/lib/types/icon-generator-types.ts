/**
 * All type definitions for the icon generator application
 */

// Style preset types
/**
 * Union type representing the available preset style identifiers.
 * Each ID corresponds to a specific visual style for icon generation.
 */
export type PresetStyleId = "Cartoon" | "ThreeDModel" | "Gradient";

/**
 * Simplified style preset configuration for icon generation.
 */
export interface StylePreset {
  displayLabel: string;
  prompt: string;
  negatives: string;
}

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

// Image types removed - no longer using external image APIs

// Icon prompt structure (matches the new simplified service)
export interface IconPrompt {
  item: string;
  prompt: string;
  styleId: PresetStyleId;
}

// UI State
export interface IconGeneratorState {
  loading: boolean;
  error: string | null;
  images: GeneratedIcon[];
  currentRequest?: IconGenerationRequest;
}

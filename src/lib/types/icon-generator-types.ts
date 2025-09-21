/**
 * All type definitions for the icon generator application
 */

// Style preset types
/**
 * Union type representing the available preset style identifiers.
 * Each ID corresponds to a specific visual style for icon generation.
 */
export type PresetStyleId = "Business" | "Cartoon" | "ThreeDModel" | "Gradient";

/**
 * Configuration interface for style presets used in icon generation.
 * Defines the visual characteristics and rendering parameters for different icon styles.
 */
export interface StylePreset {
  displayLabel: string; // UI label
  fragment: string; // positive prompt fragment
  negatives: string; // explicit exclusions
  output: {
    // rendering rules you enforce in prompts
    background: "plain" | "white" | "badge";
    stroke: "none" | "thin" | "medium" | "thick";
    shading: "flat" | "soft" | "3d";
  };
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

export interface StyleTemplate {
  name: string;
  description: string;
  keywordStrategy: string;
}

// Prompt Engineering Service Types
export interface IconPrompt {
  item: string;
  prompt: string;
  styleId: PresetStyleId;
}

export interface PromptEngineeringService {
  expandToItems(userInput: string): Promise<string[]>;
  buildIconPrompt(
    subject: string,
    styleId: PresetStyleId,
    originalInput: string,
    colors?: string[]
  ): string;
  generateIconSet(
    userInput: string,
    styleId: PresetStyleId,
    colors?: string[]
  ): Promise<IconPrompt[]>;
}

export interface OpenAIExpansionResponse {
  items: string[];
}

export interface PromptEnggServiceConfig {
  openaiApiKey?: string;
  timeout?: number;
  model?: string;
  fallbackMode?: boolean;
  rateLimitInterval?: number; // Custom rate limit interval in ms
}

// UI State
export interface IconGeneratorState {
  loading: boolean;
  error: string | null;
  images: GeneratedIcon[];
  currentRequest?: IconGenerationRequest;
}

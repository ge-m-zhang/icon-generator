/**
 * Union type representing the available preset style identifiers.
 * Each ID corresponds to a specific visual style for icon generation.
 */

/**
 * Configuration interface for style presets used in icon generation.
 * Defines the visual characteristics and rendering parameters for different icon styles.
 */
export type PresetStyleId = "Business" | "Cartoon" | "ThreeDModel" | "Gradient";

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

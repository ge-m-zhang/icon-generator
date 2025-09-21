import type { PresetStyleId, StylePreset } from "../types/icon-generator-types";

export const STYLE_PRESETS: Record<PresetStyleId, StylePreset> = {
  Business: {
    displayLabel: "Business",
    fragment:
      "professional glyph icon, white symbol on circular badge, high contrast, crisp vector edges, balanced margins, minimal decoration",
    negatives:
      "no cute faces, no sketchy texture, no 3D render, no drop shadows",
    output: { background: "badge", stroke: "none", shading: "flat" },
  },
  Cartoon: {
    displayLabel: "Cartoon",
    fragment:
      "cartoon icon with rounded proportions, friendly expression optional, soft highlights and shadows, warm approachable palette, thicker outline",
    negatives:
      "no complex scene, no hard-edged geometry, no photoreal materials",
    output: { background: "plain", stroke: "medium", shading: "soft" },
  },
  ThreeDModel: {
    displayLabel: "3D Model",
    fragment:
      "3D icon, beveled edges, soft studio lighting, subtle ambient occlusion, clean smooth materials, single object, neutral background, high clarity",
    negatives:
      "no busy environment, no noisy texture, no text or watermark, no harsh reflections",
    output: { background: "plain", stroke: "none", shading: "3d" },
  },
  Gradient: {
    displayLabel: "Gradient",
    fragment:
      "gradient vector icon with smooth 2–3 color gradient fill, crisp silhouette, very thin or no outline, modern minimal look",
    negatives:
      "no inner shadows, no 3D shading, no texture noise, no heavy outlines",
    output: { background: "plain", stroke: "thin", shading: "flat" },
  },
} as const;

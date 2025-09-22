import { PresetStyleId, StylePreset } from "../types/icon-generator-types";

export const STYLE_PRESETS: Record<PresetStyleId, StylePreset> = {
  Business: {
    displayLabel: "Business",
    prompt:
      "professional glyph icon, white symbol on circular colored badge, high contrast vector design, balanced proportions, minimal geometric style, enterprise-grade visual clarity, uniform flat lighting, solid matte colors, crisp vector edges, centered composition, vector scalable",
    negatives:
      "no cute faces, no sketchy texture, no 3D render, no drop shadows, no gradients, no decorative elements, no handdrawn style, no complex detailed scenes",
  },

  Cartoon: {
    displayLabel: "Cartoon",
    prompt:
      "cartoon icon with rounded proportions, friendly kawaii-style expression optional, soft ambient lighting, warm approachable color palette, thicker consistent outline, playful character design, matte finish with subtle highlights, organic rounded shapes, smooth curves",
    negatives:
      "no complex detailed scenes, no hard angular geometry, no realistic materials, no serious business tone, no thin lines, no busy environment, no multiple objects",
  },

  ThreeDModel: {
    displayLabel: "3D Model",
    prompt:
      "photorealistic 3D icon, beveled edges with subtle chamfers, professional studio lighting setup, soft ambient occlusion shadows, premium materials (brushed metal, glass, leather), single focused object, neutral gradient background, ultra-high detail, three-point studio lighting",
    negatives:
      "no busy environment, no multiple objects, no noisy textures, no text overlays, no harsh reflections, no cartoon style, no flat design, no complex compositions",
  },

  Gradient: {
    displayLabel: "Gradient",
    prompt:
      "modern gradient vector icon with smooth 2-3 color transitions, vibrant contemporary palette, crisp silhouette edges, ultra-minimal design, trendy UI style, perfect for digital interfaces, clean color transitions, vector perfect",
    negatives:
      "no inner shadows, no 3D depth effects, no texture noise, no heavy outlines, no realistic shading, no multiple gradients per element, no busy details",
  },
} as const;

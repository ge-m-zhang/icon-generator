import { PresetStyleId, StylePreset } from "../types/icon-generator-types";

// GLOBAL REQUIREMENTS ENFORCED ACROSS ALL ICONS:
// 1. MANDATORY: Light grey canvas background #F5F5F5 for EVERY SINGLE ICON
// 2. MANDATORY: NO text, numbers, or letters on ANY icon
// 3. MANDATORY: Consistent item sizing within each style group
// 4. MANDATORY: Solid styling (no gradients on main elements unless specified)

// Enhanced negative prompts to enforce global consistency
const ENFORCED_NEGATIVES =
  "MANDATORY LIGHT GREY CANVAS #F5F5F5, NO white canvas, NO beige canvas, NO cream canvas, NO transparent canvas, NO different canvas colors, NO background color variations, FORCE #F5F5F5 background, IDENTICAL SIZE within same style group, all objects MUST appear exactly same visual size within group, MUST have light grey canvas background #F5F5F5, NO tiny objects, NO oversized objects, consistent scale normalization across group, ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO LABELS, NO COLOR CODES, NO HEX CODES, NO TYPOGRAPHY, NO WRITING, NO WORDS, NO CAPTIONS, NO TITLES, NO SYMBOLS WITH TEXT, completely text-free icon, CONSISTENT BACKGROUND COLOR #F5F5F5 for all icons, SOLID STYLING within group";


export const STYLE_PRESETS: Record<PresetStyleId, StylePreset> = {
  Cartoon: {
    displayLabel: "Cartoon",
    prompt:
      "single {ITEM} icon, CRITICAL: MANDATORY light grey canvas background #F5F5F5 - NO OTHER BACKGROUND COLORS, cute kawaii style, bright orange and golden yellow colors only, centered composition, rounded shapes, symbol EXACTLY 75% of canvas size, IDENTICAL ITEM SIZE within Cartoon style group, FORCE SAME background color #F5F5F5 for all Cartoon icons, NORMALIZE ITEM SIZE: scale {ITEM} to fill exactly 75% of canvas IDENTICALLY regardless of object complexity, ALL Cartoon icons MUST appear exactly same visual size, SOLID styling within Cartoon group, ONE OBJECT ONLY, BACKGROUND MUST BE #F5F5F5",
    negatives: ENFORCED_NEGATIVES,
  },

  ThreeDModel: {
    displayLabel: "3D Model",
    prompt:
      "single {ITEM} icon, CRITICAL: MANDATORY light grey canvas background #F5F5F5 - NO OTHER BACKGROUND COLORS, photorealistic 3D, deep navy blue color only, centered composition, soft shadows, symbol EXACTLY 70% of canvas size, IDENTICAL ITEM SIZE within 3D style group, FORCE SAME background color #F5F5F5 for all 3D icons, NORMALIZE ITEM SIZE: scale {ITEM} to fill exactly 70% of canvas IDENTICALLY regardless of object complexity, ALL 3D icons MUST appear exactly same visual size, SOLID styling within 3D group, ONE OBJECT ONLY, BACKGROUND MUST BE #F5F5F5",
    negatives: ENFORCED_NEGATIVES,
  },

  Gradient: {
    displayLabel: "Gradient",
    prompt:
      "single {ITEM} icon, CRITICAL: MANDATORY light grey canvas background #F5F5F5 - NO OTHER BACKGROUND COLORS, linear gradient from light orange to bright pink to purple, centered composition, flat vector, symbol EXACTLY 70% of canvas size, IDENTICAL ITEM SIZE within Gradient style group, FORCE SAME background color #F5F5F5 for all Gradient icons, NORMALIZE ITEM SIZE: scale {ITEM} to fill exactly 70% of canvas IDENTICALLY regardless of object complexity, ALL Gradient icons MUST appear exactly same visual size, gradient styling within Gradient group, ONE OBJECT ONLY, BACKGROUND MUST BE #F5F5F5",
    negatives: ENFORCED_NEGATIVES,
  },
} as const;

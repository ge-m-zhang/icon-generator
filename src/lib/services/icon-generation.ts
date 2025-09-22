import OpenAI from "openai";
import type { PresetStyleId } from "@/lib/types/icon-generator-types";
import { STYLE_PRESETS } from "@/lib/constants/style-presets";
import logger from "@/lib/config/logger";

// Types
export interface IconPrompt {
  item: string;
  prompt: string;
  styleId: PresetStyleId;
}

export interface IconGenerationConfig {
  openaiApiKey?: string;
  fallbackMode?: boolean;
}

// Fallback items when OpenAI expansion fails
const FALLBACK_ITEMS = [
  "star",
  "heart",
  "circle",
  "triangle",
  "square",
  "diamond",
  "arrow",
  "leaf",
];

/**
 * Expands user input into 8 specific items using OpenAI or fallback
 */
export async function expandToItems(
  userInput: string,
  config?: IconGenerationConfig
): Promise<string[]> {
  // Use fallback if no OpenAI key or in fallback mode
  if (!config?.openaiApiKey || config.fallbackMode) {
    logger.info(
      `🔄 Using fallback items for "${userInput}" - ${
        !config?.openaiApiKey ? "No OpenAI API key" : "Fallback mode enabled"
      }`
    );
    console.log(`🔄 Using fallback items for "${userInput}":`, FALLBACK_ITEMS);
    return FALLBACK_ITEMS;
  }

  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const systemPrompt = `Convert the user input into exactly 8 concrete, physical objects that would make good icons.

Examples:
Input: "shapes" → ["star", "heart", "circle", "triangle", "square", "diamond", "arrow", "leaf"]
Input: "sports" → ["ball", "trophy", "whistle", "stopwatch", "medal", "helmet", "shoes", "goal"]

Rules:
- Always return exactly 8 items
- Items must be recognizable physical objects
- Suitable for icon design (simple, clear shapes)
- Different objects, not variations of the same thing
- Return JSON array only, no explanation`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Expand "${userInput}" into 8 objects. Return JSON array only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response");

    const items = JSON.parse(content);
    if (!Array.isArray(items) || items.length !== 8) {
      throw new Error("Invalid response format");
    }

    const cleanItems = items.map((item) => item.trim());
    logger.debug(`Expanded "${userInput}" to items`, {
      userInput,
      items: cleanItems,
    });
    return cleanItems;
  } catch (error) {
    logger.warn("OpenAI expansion failed, using fallback items", {
      userInput,
      error,
    });
    console.warn(`⚠️ OpenAI expansion failed for "${userInput}":`, error);
    console.log(`🔄 Using fallback items:`, FALLBACK_ITEMS);
    return FALLBACK_ITEMS;
  }
}

// Layer 1: Global prompt construction
class GlobalPromptLayer {
  static getBaseRequirements(): string {
    return "CRITICAL: light grey background #F5F5F5 EXACTLY - NO OTHER BACKGROUND COLORS ALLOWED, perfectly centered, 512x512 format, professional icon design, MANDATORY CONSISTENT BACKGROUND COLOR #F5F5F5 across ALL icons, FORCE light grey canvas #F5F5F5";
  }

  static getGlobalNegatives(): string {
    return "NO text, NO labels, NO words, NO letters, NO numbers, NO writing, NO size inconsistencies, NO background variations, NO different background colors, NO white background, NO beige background, NO transparent background, NO colored backgrounds, ABSOLUTELY NO background variations, STRICTLY #F5F5F5 background ONLY";
  }

  static getSizeNormalization(item: string): string {
    return `normalize ${item} to standard icon proportions within style group, consistent visual size across same style icons, ignore natural object size differences`;
  }
}

// Layer 2: Style-specific prompt construction
class StylePromptLayer {
  static getStyleVisuals(styleId: PresetStyleId): string {
    const styleSpecs = STYLE_PRESETS[styleId];
    if (!styleSpecs) {
      throw new Error(`Unknown style: ${styleId}`);
    }
    return styleSpecs.prompt;
  }

  static getStyleNegatives(styleId: PresetStyleId): string {
    const styleSpecs = STYLE_PRESETS[styleId];
    if (!styleSpecs) {
      throw new Error(`Unknown style: ${styleId}`);
    }
    return styleSpecs.negatives;
  }

  static getStyleSpecificRules(styleId: PresetStyleId): string {
    switch (styleId) {
      case "Cartoon":
        return "CRITICAL: consistent item size (75% of canvas) across ALL Cartoon icons, same kawaii proportions, same rounded style, NO size variations within Cartoon style";
      case "ThreeDModel":
        return "CRITICAL: consistent item size (70% of canvas) across ALL 3D icons, uniform 3D lighting and depth, same rendering quality, NO size variations within 3D style";
      case "Gradient":
        return "CRITICAL: consistent item size (70% of canvas) across ALL Gradient icons, identical gradient direction and color stops, NO size variations within Gradient style";
      default:
        return "consistent sizing within style group";
    }
  }
}

// Layer 3: Individual item construction
class ItemPromptLayer {
  static getItemSpecification(item: string): string {
    return `single ${item} icon, realistic object representation, show actual ${item} structure`;
  }

  static getItemSpecificAdjustments(item: string): string {
    // Handle any item-specific edge cases or adjustments
    return `focus on ${item} essential characteristics, maintain object clarity`;
  }
}

/**
 * Builds a complete prompt for a specific item and style using 3-layer composition
 */
export function buildPrompt(item: string, styleId: PresetStyleId): string {
  // Layer 3: Individual item requirements
  const itemSpec = ItemPromptLayer.getItemSpecification(item);
  const itemAdjustments = ItemPromptLayer.getItemSpecificAdjustments(item);

  // Layer 2: Style-specific requirements
  const styleVisuals = StylePromptLayer.getStyleVisuals(styleId).replace(
    "{ITEM}",
    item
  );
  const styleRules = StylePromptLayer.getStyleSpecificRules(styleId);

  // Layer 1: Global requirements
  const globalBase = GlobalPromptLayer.getBaseRequirements();
  const sizeNorm = GlobalPromptLayer.getSizeNormalization(item);

  // Compose positive prompt
  const positivePrompt = [
    itemSpec,
    itemAdjustments,
    styleVisuals,
    styleRules,
    globalBase,
    sizeNorm,
  ]
    .filter(Boolean)
    .join(", ");

  // Compose negative prompt
  const negativePrompt = [
    GlobalPromptLayer.getGlobalNegatives(),
    StylePromptLayer.getStyleNegatives(styleId),
  ]
    .filter(Boolean)
    .join(", ");

  return `${positivePrompt}, NEGATIVE: ${negativePrompt}`;
}

/**
 * Generates a complete icon set by expanding input and creating prompts
 */
export async function generateIconSet(
  userInput: string,
  styleId: PresetStyleId,
  config?: IconGenerationConfig
): Promise<IconPrompt[]> {
  console.log(`🎯 Generating icon set for "${userInput}" (${styleId})`);

  // Expand to 8 items
  const items = await expandToItems(userInput, config);

  // Build prompts for each item
  const iconSet = items.map((item) => ({
    item,
    prompt: buildPrompt(item, styleId),
    styleId,
  }));

  console.log(`✅ Generated ${iconSet.length} icon prompts`);

  return iconSet;
}

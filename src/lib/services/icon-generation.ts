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
  "paper clip",
  "stapler",
  "pen",
  "calculator",
  "folder",
  "notebook",
  "scissors",
  "ruler",
];

// Global constraints for all icons
const GLOBAL_CONSTRAINTS =
  "512x512 pixels, professional icon design, high clarity, ABSOLUTELY NO TEXT OR LABELS, single object only, clean design, no people, no hands, no multiple objects";

/**
 * Expands user input into 8 specific items using OpenAI or fallback
 */
export async function expandToItems(
  userInput: string,
  config?: IconGenerationConfig
): Promise<string[]> {
  // Use fallback if no OpenAI key or in fallback mode
  if (!config?.openaiApiKey || config.fallbackMode) {
    logger.warn(`Using fallback items for "${userInput}" - OpenAI not available`);
    return FALLBACK_ITEMS;
  }

  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const systemPrompt = `Convert the user input into exactly 8 concrete, physical objects that would make good icons.

Examples:
Input: "office supplies" → ["paper clip", "stapler", "pen", "calculator", "folder", "notebook", "scissors", "ruler"]
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
    logger.debug(`Expanded "${userInput}" to items`, { userInput, items: cleanItems });
    return cleanItems;
  } catch (error) {
    logger.warn('OpenAI expansion failed, using fallback items', { userInput, error });
    return FALLBACK_ITEMS;
  }
}

/**
 * Builds a complete prompt for a specific item and style
 */
export function buildPrompt(
  item: string,
  styleId: PresetStyleId,
  colors?: string[]
): string {
  const style = STYLE_PRESETS[styleId];
  if (!style) {
    throw new Error(`Unknown style: ${styleId}`);
  }

  const parts = [
    `${item} icon`,
    style.prompt,
    GLOBAL_CONSTRAINTS,
    colors?.length ? `use colors: ${colors.join(", ")}` : "",
    `part of cohesive 8-icon set`,
    `negative: ${style.negatives}, no text, no labels, no words`,
  ];

  const prompt = parts.filter((part) => part.length > 0).join(", ");
  return prompt;
}

/**
 * Generates a complete icon set by expanding input and creating prompts
 */
export async function generateIconSet(
  userInput: string,
  styleId: PresetStyleId,
  colors?: string[],
  config?: IconGenerationConfig
): Promise<IconPrompt[]> {
  // Expand to 8 items
  const items = await expandToItems(userInput, config);

  // Build prompts for each item
  const iconSet = items.map((item) => ({
    item,
    prompt: buildPrompt(item, styleId, colors),
    styleId,
  }));

  return iconSet;
}

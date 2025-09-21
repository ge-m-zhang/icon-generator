import { PresetStyleId } from "@/lib/types";

export interface StyleTemplate {
  name: string;
  description: string;
  keywordStrategy: string;
}

export const STYLE_TEMPLATES: Record<PresetStyleId, StyleTemplate> = {
  Business: {
    name: "Business Style",
    description: "Professional white glyphs on circular badges",
    keywordStrategy: "professional clean badge minimal corporate",
  },
  Cartoon: {
    name: "Cartoon Style",
    description: "Friendly rounded proportions with soft shading",
    keywordStrategy: "cartoon friendly rounded colorful playful",
  },
  ThreeDModel: {
    name: "3D Model Style",
    description: "Beveled edges with studio lighting",
    keywordStrategy: "3d rendered realistic shiny metallic",
  },
  Gradient: {
    name: "Gradient Style",
    description: "Smooth gradient fills with minimal outline",
    keywordStrategy: "gradient smooth modern vibrant colorful",
  },
};

export const ICON_CATEGORIES = {
  interface: ["home", "search", "menu", "settings", "user", "bell", "close"],
  media: ["play", "pause", "stop", "music", "video", "camera", "image"],
  communication: ["mail", "message", "phone", "chat", "comment", "share"],
  navigation: ["arrow", "back", "forward", "up", "down", "left", "right"],
  file: ["folder", "file", "download", "upload", "save", "edit", "delete"],
  business: ["chart", "graph", "money", "card", "shop", "bag", "cart"],
};

export const extractIconKeywords = (prompt: string): string[] => {
  const words = prompt
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((word) => word.length > 2)
    .slice(0, 6);

  const relevantKeywords: string[] = [];

  for (const category of Object.values(ICON_CATEGORIES)) {
    for (const keyword of category) {
      if (
        words.some(
          (word) =>
            word.includes(keyword) ||
            keyword.includes(word) ||
            levenshteinDistance(word, keyword) <= 2
        )
      ) {
        relevantKeywords.push(keyword);
      }
    }
  }

  return relevantKeywords.length > 0
    ? relevantKeywords.slice(0, 4)
    : words.slice(0, 4);
};

export const enhancePromptForStyle = (
  basePrompt: string,
  style: PresetStyleId
): string => {
  const template = STYLE_TEMPLATES[style];
  const keywords = extractIconKeywords(basePrompt);

  return `${keywords.join(" ")} ${template.keywordStrategy} icon symbol`;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[str2.length][str1.length];
};

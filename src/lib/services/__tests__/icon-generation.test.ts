import {
  expandToItems,
  buildPrompt,
  generateIconSet,
  IconGenerationConfig,
} from "../icon-generation";

import type { PresetStyleId } from "@/lib/types/icon-generator-types";

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

describe("icon-generation service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReset();
  });

  describe("expandToItems", () => {
    it("should use fallback when no OpenAI key provided", async () => {
      const result = await expandToItems("office");

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "star",
        "heart",
        "circle",
        "triangle",
        "square",
        "diamond",
        "arrow",
        "leaf",
      ]);
    });

    it("should use fallback when fallbackMode is true", async () => {
      const config: IconGenerationConfig = {
        openaiApiKey: "test-key",
        fallbackMode: true,
      };

      const result = await expandToItems("sports", config);

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "star",
        "heart",
        "circle",
        "triangle",
        "square",
        "diamond",
        "arrow",
        "leaf",
      ]);
    });

    it("should use fallback for any input when no OpenAI key", async () => {
      const result = await expandToItems("completely unknown category");

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "star",
        "heart",
        "circle",
        "triangle",
        "square",
        "diamond",
        "arrow",
        "leaf",
      ]);
    });

    it("should return consistent fallback regardless of input", async () => {
      const result = await expandToItems("kitchen utensils");

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "star",
        "heart",
        "circle",
        "triangle",
        "square",
        "diamond",
        "arrow",
        "leaf",
      ]);
    });

    it("should use OpenAI when key is provided and not in fallback mode", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content:
                '["guitar", "piano", "violin", "drums", "microphone", "headphones", "speaker", "note"]',
            },
          },
        ],
      });

      const config: IconGenerationConfig = {
        openaiApiKey: "test-key",
        fallbackMode: false,
      };

      const result = await expandToItems("music", config);

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "guitar",
        "piano",
        "violin",
        "drums",
        "microphone",
        "headphones",
        "speaker",
        "note",
      ]);
      expect(mockCreate).toHaveBeenCalled();
    });

    it("should fallback to default items when OpenAI fails", async () => {
      mockCreate.mockRejectedValue(new Error("API Error"));

      const config: IconGenerationConfig = {
        openaiApiKey: "test-key",
        fallbackMode: false,
      };

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await expandToItems("music", config);

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        "star",
        "heart",
        "circle",
        "triangle",
        "square",
        "diamond",
        "arrow",
        "leaf",
      ]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ OpenAI expansion failed for "music":',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("buildPrompt", () => {
    it("should build correct prompt for Gradient style", () => {
      const result = buildPrompt("star", "Gradient");

      expect(result).toContain("star");
      expect(result).toContain(
        "linear gradient from light orange to bright pink"
      );
      expect(result).toContain("light grey background #F5F5F5");
      expect(result).toContain("professional icon design");
      expect(result).toContain("NEGATIVE:");
    });

    it("should build correct prompt for Cartoon style", () => {
      const result = buildPrompt("ball", "Cartoon");

      expect(result).toContain("ball");
      expect(result).toContain("cute kawaii style");
      expect(result).toContain("light grey background #F5F5F5");
      expect(result).toContain("NEGATIVE:");
    });

    it("should throw error for case-insensitive style IDs that dont match", () => {
      // Cast to unknown first to bypass TypeScript checking for testing invalid inputs
      expect(() =>
        buildPrompt("item", "business" as unknown as PresetStyleId)
      ).toThrow("Unknown style: business");
    });

    it("should throw error for invalid style", () => {
      // Cast to unknown first to bypass TypeScript checking for testing invalid inputs
      expect(() =>
        buildPrompt("item", "InvalidStyle" as unknown as PresetStyleId)
      ).toThrow("Unknown style: InvalidStyle");
    });
  });

  describe("generateIconSet", () => {
    it("should generate complete icon set", async () => {
      const result = await generateIconSet("shapes", "Cartoon");

      expect(result).toHaveLength(8);
      expect(result[0]).toMatchObject({
        item: expect.any(String),
        prompt: expect.any(String),
        styleId: "Cartoon",
      });
    });

    it("should handle OpenAI config", async () => {
      const result = await generateIconSet("tech", "ThreeDModel", undefined);

      expect(result).toHaveLength(8);
      expect(result[0].styleId).toBe("ThreeDModel");
    });

    it("should log generation progress", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await generateIconSet("music", "Gradient");

      expect(consoleSpy).toHaveBeenCalledWith(
        '🎯 Generating icon set for "music" (Gradient)'
      );
      expect(consoleSpy).toHaveBeenCalledWith("✅ Generated 8 icon prompts");

      consoleSpy.mockRestore();
    });
  });
});

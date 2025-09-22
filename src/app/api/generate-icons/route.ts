import { NextRequest, NextResponse } from "next/server";
import {
  IconGenerationRequest,
  IconGenerationResponse,
  GeneratedIcon,
} from "@/lib/types/icon-generator-types";
import { generateIconSet } from "@/lib/services/icon-generation";
import { FluxSchnellClient } from "@/lib/services/replicate/flux-schnell-client";
import {
  FluxError,
  FluxSchnellClientConfig,
} from "@/lib/types/flux-schnell-types";
import { getValidatedEnvVar } from "@/lib/config/environment";
import logger from "@/lib/config/logger";

// Maximum value for 32-bit signed integer (2^31 - 1)
const MAX_32BIT_INT = 2147483647;

// Production-ready icon generation using FluxSchnell

export const POST = async (request: NextRequest) => {
  try {
    const body: IconGenerationRequest = await request.json();
    const { prompt, style } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use the simplified icon generation service
    let openaiConfig;
    try {
      const openaiApiKey = getValidatedEnvVar("OPENAI_API_KEY");
      openaiConfig = {
        openaiApiKey,
        fallbackMode: false,
      };
    } catch (error) {
      logger.error(
        "Environment configuration error - Missing OpenAI API key:",
        error
      );
      return NextResponse.json(
        {
          success: false,
          error: "Service configuration error: Missing OpenAI API key",
        },
        { status: 500 }
      );
    }

    const iconSet = await generateIconSet(
      prompt,
      style,
      openaiConfig
    );
    const timestamp = Date.now();

    // Initialize FluxSchnell client for real image generation
    let fluxClient: FluxSchnellClient;
    try {
      const replicateApiToken = getValidatedEnvVar("REPLICATE_API_TOKEN");

      const fluxConfig: FluxSchnellClientConfig = {
        apiToken: replicateApiToken,
        timeout: 30000,
        maxRetries: 3,
      };
      fluxClient = new FluxSchnellClient(fluxConfig);
    } catch (error) {
      logger.error(
        "Environment configuration error - Missing Replicate API token:",
        error
      );
      return NextResponse.json(
        {
          success: false,
          error: "Service configuration error: Missing API token",
        },
        { status: 500 }
      );
    }

    // Generate base seed for the entire set to ensure visual consistency
    const baseSeedString = `${prompt}-${style}-${timestamp}`;
    const baseSeed =
      baseSeedString
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % MAX_32BIT_INT;

    const images: GeneratedIcon[] = await Promise.all(
      iconSet.map(async (iconPrompt, index) => {
        // Create consistent seed variation for each icon in the set
        // This ensures visual consistency while allowing slight variations
        const iconSeed = (baseSeed + index * 137) % MAX_32BIT_INT; // 137 is prime for better distribution

        try {
          // Log the prompt being sent to Replicate
          logger.debug(`Replicate prompt for "${iconPrompt.item}"`, {
            prompt: iconPrompt.prompt,
          });

          // Generate real image using FluxSchnell with sophisticated prompt engineering
          const result = await fluxClient.generateImages({
            prompt: iconPrompt.prompt, // Use sophisticated engineered prompt
            num_inference_steps: 4, // Optimized for speed and quality
            aspect_ratio: "1:1", // Perfect for icons
            output_format: "png", // Best quality for icons
            go_fast: false, // Prioritize quality for final icons
            seed: iconSeed, // Ensure consistency across generations
            requestId: `icon-${timestamp}-${index}`,
          });

          return {
            id: result.requestId,
            item: iconPrompt.item,
            url: result.imageUrls[0], // Use first generated image
            downloadUrl: result.imageUrls[0], // Same URL for download
            style,
            originalPrompt: prompt,
          };
        } catch (error) {
          logger.error(
            `Failed to generate image for "${iconPrompt.item}"`,
            error
          );

          // Provide fallback with error context
          if (error instanceof FluxError) {
            logger.error(
              `FluxError [${error.code}]: ${error.message} (Request: ${error.requestId})`
            );
          }

          // Return error placeholder but don't fail entire request
          return {
            id: `icon-${timestamp}-${index}-error`,
            item: iconPrompt.item,
            url: "/favicon.ico", // Fallback on error
            downloadUrl: "/favicon.ico",
            style,
            originalPrompt: prompt,
          };
        }
      })
    );

    const response: IconGenerationResponse = {
      success: true,
      images,
      metadata: {
        originalPrompt: prompt,
        style,
        generatedItems: iconSet.map((icon) => icon.item),
      },
    };

    // Calculate generation metrics
    const successfulGenerations = images.filter(
      (img) => !img.id.includes("-error")
    ).length;
    const failedGenerations = images.length - successfulGenerations;
    const totalCost = successfulGenerations * 0.003; // $0.003 per image

    logger.info("Icon generation completed", {
      totalRequested: images.length,
      successful: successfulGenerations,
      failed: failedGenerations,
      totalCost: `$${totalCost.toFixed(4)}`,
      itemCount: iconSet.length,
      style,
      success: true,
    });

    // Get cost tracking from client for additional metrics
    const costTracker = fluxClient.getCostTracker();
    logger.info("Session cost summary", {
      sessionTotal: `$${costTracker.totalCost.toFixed(4)}`,
      sessionImages: costTracker.totalImagesGenerated,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Icon generation failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate icons",
      },
      { status: 500 }
    );
  }
};

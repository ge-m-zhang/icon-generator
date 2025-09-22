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
    const openaiConfig = {
      openaiApiKey: process.env.OPENAI_API_KEY,
      fallbackMode: false
    };
    const iconSet = await generateIconSet(prompt, style, undefined, openaiConfig);
    const timestamp = Date.now();

    console.log(`🎯 Icon Generation Request:`, {
      originalPrompt: prompt,
      style,
      generatedItems: iconSet.map((icon) => icon.item),
      timestamp: new Date().toISOString(),
    });

    // Initialize FluxSchnell client for real image generation
    const fluxConfig: FluxSchnellClientConfig = {
      apiToken: process.env.REPLICATE_API_TOKEN!,
      maxPollingTimeout: 60000,
      pollingInterval: 1000,
      rateLimit: 600,
      maxRetries: 3,
      baseRetryDelay: 1000,
      enableLogging: true,
    };
    const fluxClient = new FluxSchnellClient(fluxConfig);
    console.log(
      `🚀 FluxSchnell client initialized for ${iconSet.length} icons`
    );

    // Generate base seed for the entire set to ensure visual consistency
    const baseSeedString = `${prompt}-${style}-${timestamp}`;
    const baseSeed =
      baseSeedString
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2147483647;

    const images: GeneratedIcon[] = await Promise.all(
      iconSet.map(async (iconPrompt, index) => {
        // Create consistent seed variation for each icon in the set
        // This ensures visual consistency while allowing slight variations
        const iconSeed = (baseSeed + index * 137) % 2147483647; // 137 is prime for better distribution

        console.log(
          `🖼️  Generating image ${index + 1}/${iconSet.length}: "${
            iconPrompt.item
          }" -> Seed: ${iconSeed}`
        );

        try {
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

          console.log(
            `✅ Generated ${result.imageUrls.length} images for "${
              iconPrompt.item
            }" (Cost: $${result.cost.toFixed(4)}, Time: ${
              result.generationTime
            }ms)`
          );

          return {
            id: result.requestId,
            item: iconPrompt.item,
            url: result.imageUrls[0], // Use first generated image
            downloadUrl: result.imageUrls[0], // Same URL for download
            style,
            originalPrompt: prompt,
          };
        } catch (error) {
          console.error(
            `❌ Failed to generate image for "${iconPrompt.item}":`,
            error
          );

          // Provide fallback with error context
          if (error instanceof FluxError) {
            console.error(
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

    console.log(`✅ Icon generation completed:`, {
      totalRequested: images.length,
      successful: successfulGenerations,
      failed: failedGenerations,
      totalCost: `$${totalCost.toFixed(4)}`,
      items: iconSet.map((icon) => icon.item),
      style,
      success: true,
    });

    // Get cost tracking from client for additional metrics
    const costTracker = fluxClient.getCostTracker();
    console.log(`💰 Session cost summary:`, {
      sessionTotal: `$${costTracker.totalCost.toFixed(4)}`,
      sessionImages: costTracker.totalImagesGenerated,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Icon generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate icons",
      },
      { status: 500 }
    );
  }
};

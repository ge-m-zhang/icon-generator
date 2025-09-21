import { NextRequest, NextResponse } from "next/server";
import {
  IconGenerationRequest,
  IconGenerationResponse,
  GeneratedIcon,
} from "@/lib/types";

const ICON_KEYWORDS = [
  "home",
  "search",
  "heart",
  "star",
  "user",
  "bell",
  "settings",
  "camera",
  "music",
  "mail",
  "phone",
  "calendar",
  "cloud",
  "download",
  "upload",
  "share",
  "menu",
  "play",
  "pause",
  "stop",
  "edit",
  "delete",
  "save",
  "folder",
];

const generateIconItems = (prompt: string): string[] => {
  const words = prompt
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2);
  const relevantKeywords = ICON_KEYWORDS.filter((keyword) =>
    words.some((word) => word.includes(keyword) || keyword.includes(word))
  );

  // Always return exactly 8 items
  if (relevantKeywords.length >= 8) {
    return relevantKeywords.slice(0, 8);
  }

  // Combine relevant keywords with generic ones to reach 8
  const combined = [
    ...relevantKeywords,
    ...ICON_KEYWORDS.filter((keyword) => !relevantKeywords.includes(keyword)),
  ];
  return combined.slice(0, 8);
};

const getUnsplashImage = async (
  query: string,
  seed?: number
): Promise<string> => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY not found, using Picsum fallback");
    const imageId = (seed || Math.floor(Math.random() * 1000)) % 1000;
    return `https://picsum.photos/512/512?random=${imageId}`;
  }

  try {
    // Enhanced query for better icon-style results
    const iconQuery = `${query} symbol minimalist simple clean geometric`;

    const response = await fetch(
      `https://api.unsplash.com/search/photos?` +
        `query=${encodeURIComponent(iconQuery)}&` +
        `per_page=10&` +
        `orientation=squarish&` +
        `content_filter=high&` +
        `order_by=relevance`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Unsplash API error: ${response.status} - ${errorText}`);
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `Unsplash API: Found ${
        data.results?.length || 0
      } results for "${iconQuery}"`
    );

    if (data.results && data.results.length > 0) {
      // Use seed to pick a consistent result from the available options
      const index = seed ? seed % data.results.length : 0;
      const selectedImage = data.results[index];

      // Use the small size (400x400) for better performance, or regular for quality
      return selectedImage.urls.small || selectedImage.urls.regular;
    }

    // Fallback to Picsum if no results
    console.warn(
      `No Unsplash results for "${iconQuery}", using Picsum fallback`
    );
    const imageId = (seed || Math.floor(Math.random() * 1000)) % 1000;
    return `https://picsum.photos/512/512?random=${imageId}`;
  } catch (error) {
    console.error("Unsplash API error:", error);
    // Fallback to Picsum on error
    const imageId = (seed || Math.floor(Math.random() * 1000)) % 1000;
    return `https://picsum.photos/512/512?random=${imageId}`;
  }
};

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

    const iconItems = generateIconItems(prompt);
    const timestamp = Date.now();

    // Create style-specific query enhancement using object literal lookup
    const styleModifiers = {
      Business: "professional minimalist clean badge",
      Cartoon: "cartoon friendly rounded colorful",
      ThreeDModel: "3d rendered realistic shiny",
      Gradient: "gradient smooth modern vibrant",
    };
    const styleModifier = styleModifiers[style] || "minimal clean";

    const images: GeneratedIcon[] = await Promise.all(
      iconItems.map(async (item, index) => {
        const query = `${item} ${styleModifier} icon`;
        const seed = timestamp + index; // Ensure consistent but different images
        const imageUrl = await getUnsplashImage(query, seed);
        const downloadUrl = imageUrl; // Same URL for download

        return {
          id: `icon-${timestamp}-${index}`,
          item,
          url: imageUrl,
          downloadUrl,
          style,
          originalPrompt: prompt,
        };
      })
    );

    const response: IconGenerationResponse = {
      success: true,
      images,
      metadata: {
        originalPrompt: prompt,
        style,
        generatedItems: iconItems,
      },
    };

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

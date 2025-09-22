/**
 * Image processing utilities for background normalization
 */

// Target background color (light grey #F5F5F5)
const TARGET_BACKGROUND = {
  r: 245,
  g: 245,
  b: 245,
  a: 255,
};

// Tolerance for background detection (how close colors need to be to be considered "background")
const BACKGROUND_TOLERANCE = 30;

/**
 * Normalizes background color to consistent light grey (#F5F5F5)
 * Works in browser environment using Canvas API
 */
export const normalizeBackgroundColor = async (
  imageUrl: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Check if this pixel is likely background
          if (isBackgroundPixel(r, g, b, a)) {
            // Replace with target background color
            data[i] = TARGET_BACKGROUND.r;
            data[i + 1] = TARGET_BACKGROUND.g;
            data[i + 2] = TARGET_BACKGROUND.b;
            data[i + 3] = TARGET_BACKGROUND.a;
          }
        }

        // Put processed data back to canvas
        ctx.putImageData(imageData, 0, 0);

        // Convert to data URL
        const processedImageUrl = canvas.toDataURL("image/png", 0.9);
        resolve(processedImageUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

/**
 * Determines if a pixel is likely a background pixel
 */
const isBackgroundPixel = (
  r: number,
  g: number,
  b: number,
  a: number
): boolean => {
  // Skip transparent or semi-transparent pixels
  if (a < 250) return false;

  // Check for white-ish backgrounds
  if (isNearColor(r, g, b, 255, 255, 255, BACKGROUND_TOLERANCE)) {
    return true;
  }

  // Check for light grey backgrounds
  if (isNearColor(r, g, b, 245, 245, 245, BACKGROUND_TOLERANCE)) {
    return true;
  }

  // Check for beige/cream backgrounds
  if (isNearColor(r, g, b, 245, 240, 225, BACKGROUND_TOLERANCE)) {
    return true;
  }

  // Check for very light colors that are likely backgrounds
  const brightness = (r + g + b) / 3;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);

  // High brightness, low saturation = likely background
  if (brightness > 220 && saturation < 30) {
    return true;
  }

  return false;
};

/**
 * Checks if a color is near another color within tolerance
 */
const isNearColor = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  tolerance: number
): boolean => {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
};

/**
 * Edge-based background detection for more accurate processing
 * Samples pixels from the edges of the image to determine background color
 */
export const normalizeBackgroundColorAdvanced = async (
  imageUrl: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample edge pixels to detect actual background color
        const backgroundColors = detectBackgroundColors(
          data,
          canvas.width,
          canvas.height
        );

        // Process each pixel with detected background colors
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Check if this pixel matches any detected background color
          if (isBackgroundPixelAdvanced(r, g, b, a, backgroundColors)) {
            data[i] = TARGET_BACKGROUND.r;
            data[i + 1] = TARGET_BACKGROUND.g;
            data[i + 2] = TARGET_BACKGROUND.b;
            data[i + 3] = TARGET_BACKGROUND.a;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const processedImageUrl = canvas.toDataURL("image/png", 0.9);
        resolve(processedImageUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

/**
 * Detects background colors by sampling edge pixels
 */
const detectBackgroundColors = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): Array<{ r: number; g: number; b: number }> => {
  const colorCounts = new Map<
    string,
    { count: number; r: number; g: number; b: number }
  >();

  // Sample edge pixels
  const samplePixels = [
    // Top and bottom edges
    ...Array.from({ length: width }, (_, x) => [x, 0]),
    ...Array.from({ length: width }, (_, x) => [x, height - 1]),
    // Left and right edges
    ...Array.from({ length: height }, (_, y) => [0, y]),
    ...Array.from({ length: height }, (_, y) => [width - 1, y]),
  ];

  for (const [x, y] of samplePixels) {
    const index = (y * width + x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];

    // Only consider opaque pixels
    if (a > 240) {
      const colorKey = `${Math.round(r / 10) * 10}-${Math.round(g / 10) * 10}-${
        Math.round(b / 10) * 10
      }`;
      const existing = colorCounts.get(colorKey);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(colorKey, { count: 1, r, g, b });
      }
    }
  }

  // Return the most common colors (likely backgrounds)
  return Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3 most common edge colors
};

/**
 * Advanced background pixel detection using detected background colors
 */
const isBackgroundPixelAdvanced = (
  r: number,
  g: number,
  b: number,
  a: number,
  backgroundColors: Array<{ r: number; g: number; b: number }>
): boolean => {
  if (a < 250) return false;

  for (const bgColor of backgroundColors) {
    if (
      isNearColor(
        r,
        g,
        b,
        bgColor.r,
        bgColor.g,
        bgColor.b,
        BACKGROUND_TOLERANCE
      )
    ) {
      return true;
    }
  }

  return false;
};

/**
 * File operation utilities
 */

/**
 * Detect image format from URL or content type
 * Only supports PNG and JPG formats as specified for icon downloads
 */
export const detectImageFormat = async (
  url: string
): Promise<"png" | "jpg"> => {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid URL provided for format detection");
  }

  try {
    // First try to detect from URL extension (only PNG/JPG supported)
    const urlFormat = url.toLowerCase().match(/\.(png|jpg|jpeg)(\?.*)?$/);
    if (urlFormat) {
      return urlFormat[1] === "jpeg" ? "jpg" : (urlFormat[1] as "png" | "jpg");
    }

    // If not found in URL, fetch headers to check content-type
    const response = await fetch(url, { method: "HEAD" });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image headers: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");

    if (!contentType) {
      throw new Error("No content-type header found in response");
    }

    if (contentType.includes("png")) return "png";
    if (contentType.includes("jpeg")) return "jpg";

    // If format is not PNG or JPG, throw error
    throw new Error(
      `Unsupported image format detected: ${contentType}. Only PNG and JPG are supported.`
    );
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (
      error instanceof Error &&
      error.message.includes("Unsupported image format")
    ) {
      throw error;
    }

    // For network errors or other issues, default to PNG with warning
    console.warn("Could not detect image format, defaulting to PNG:", error);
    return "png";
  }
};

export const downloadImage = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!url || typeof url !== "string") {
      reject(new Error("Invalid URL provided for download"));
      return;
    }

    if (!filename || typeof filename !== "string") {
      reject(new Error("Invalid filename provided for download"));
      return;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Download failed: ${response.status} ${response.statusText}`
          );
        }
        return response.blob();
      })
      .then((blob) => {
        if (!blob || blob.size === 0) {
          throw new Error("Downloaded file is empty or invalid");
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        resolve();
      })
      .catch((error) => {
        reject(new Error(`Image download failed: ${error.message}`));
      });
  });
};

export const formatIconFilename = (
  item: string,
  style: string,
  format: "png" | "jpg" = "png"
): string => {
  // Validate inputs
  if (!item || typeof item !== "string") {
    throw new Error("Invalid item name provided for filename formatting");
  }

  if (!style || typeof style !== "string") {
    throw new Error("Invalid style name provided for filename formatting");
  }

  if (format !== "png" && format !== "jpg") {
    throw new Error(
      `Invalid format "${format}". Only "png" and "jpg" are supported.`
    );
  }

  // Validate that original strings contain at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(item)) {
    throw new Error(
      "Item name must contain at least one alphanumeric character"
    );
  }

  if (!/[a-zA-Z0-9]/.test(style)) {
    throw new Error(
      "Style name must contain at least one alphanumeric character"
    );
  }

  const cleanItem = item.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cleanStyle = style.toLowerCase().replace(/[^a-z0-9]/g, "-");

  // Remove multiple consecutive dashes and trim
  const sanitizedItem = cleanItem.replace(/-+/g, "-").replace(/^-|-$/g, "");
  const sanitizedStyle = cleanStyle.replace(/-+/g, "-").replace(/^-|-$/g, "");

  return `${sanitizedItem}-${sanitizedStyle}-icon.${format}`;
};

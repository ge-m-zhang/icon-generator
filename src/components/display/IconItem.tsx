"use client";

import Image from "next/image";
import { Button, Box, Flex, Typography } from "@gmzh/react-ui";
import { GeneratedIcon } from "@/lib/types";

interface IconItemProps {
  icon: GeneratedIcon;
  onDownload?: (icon: GeneratedIcon) => void;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  showDownload?: boolean;
}

export const IconItem = ({
  icon,
  onDownload,
  size = "medium",
  showLabel = true,
  showDownload = true,
}: IconItemProps) => {
  const sizeClasses = {
    small: { width: 96, height: 96, className: "w-24 h-24" },
    medium: { width: 128, height: 128, className: "w-32 h-32" },
    large: { width: 160, height: 160, className: "w-40 h-40" },
  };

  const sizeConfig = sizeClasses[size];

  // Sanitize filename for download
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^a-z0-9\-_]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(icon);
      return;
    }

    // Default download behavior for 512x512 PNG with sanitized filename
    try {
      const response = await fetch(icon.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedItem = sanitizeFilename(icon.item);
      const sanitizedStyle = sanitizeFilename(icon.style);
      a.download = `${sanitizedItem}-${sanitizedStyle}-512x512.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      gap="xs"
      margin="sm"
      className="text-center"
    >
      {/* Icon with neutral tile look and accessibility */}
      <Box
        padding="xs"
        background="gray-50"
        rounded="lg"
        shadow="sm"
        className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-all duration-200 ease-in-out hover:shadow-md hover:ring-2 hover:ring-blue-200 hover:ring-opacity-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 focus-within:outline-none"
        tabIndex={0}
        role="img"
        aria-label={`${icon.item} icon in ${icon.style} style`}
      >
        {/* 1:1 Square container with locked aspect ratio */}
        <Box
          className={`${sizeConfig.className} aspect-square overflow-hidden flex items-center justify-center`}
          rounded="md"
          background="white"
        >
          <Image
            src={icon.url}
            alt={`${icon.item} icon in ${icon.style} style`}
            width={sizeConfig.width}
            height={sizeConfig.height}
            className={`${sizeConfig.className} object-contain`}
            loading="lazy"
            sizes={`${sizeConfig.width}px`}
          />
        </Box>
      </Box>

      {/* Label below icon */}
      {showLabel && (
        <Typography
          variant="body2"
          align="center"
          className="capitalize font-medium text-gray-700 dark:text-gray-300"
        >
          {icon.item}
        </Typography>
      )}

      {/* Download button below label */}
      {showDownload && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleDownload}
          className="min-w-[120px] transition-all duration-200 ease-in-out hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:hover:bg-blue-900 dark:hover:border-blue-600 dark:hover:text-blue-300"
        >
          Download PNG
        </Button>
      )}
    </Flex>
  );
};

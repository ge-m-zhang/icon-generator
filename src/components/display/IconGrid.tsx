"use client";

import { Box, Typography } from "@gmzh/react-ui";
import { GeneratedIcon } from "@/lib/types";
import { IconItem } from "./IconItem";

interface IconGridProps {
  icons: GeneratedIcon[];
  onDownload?: (icon: GeneratedIcon) => void;
  columns?: number;
  itemSize?: "small" | "medium" | "large";
  showLabels?: boolean;
  showDownload?: boolean;
  title?: string;
}

export const IconGrid = ({
  icons,
  onDownload,
  columns = 4,
  itemSize = "medium",
  showLabels = true,
  showDownload = true,
  title = "Generated Icons",
}: IconGridProps) => {
  if (icons.length === 0) {
    return null;
  }

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <Box>
      {title && (
        <Box margin="lg" className="text-center">
          <Typography variant="h3" align="center">
            {title}
          </Typography>
        </Box>
      )}

      <Box
        className={`grid ${
          gridClasses[columns as keyof typeof gridClasses] || "grid-cols-4"
        } gap-6 max-w-5xl mx-auto justify-items-center`}
      >
        {icons.map((icon) => (
          <IconItem
            key={icon.id}
            icon={icon}
            onDownload={onDownload}
            size={itemSize}
            showLabel={showLabels}
            showDownload={showDownload}
          />
        ))}
      </Box>
    </Box>
  );
};

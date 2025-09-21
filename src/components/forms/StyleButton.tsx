"use client";

import { Box, Typography } from "@gmzh/react-ui";

interface StyleButtonProps {
  label: string;
  description: string;
  isSelected: boolean;
  selectedStyles: string;
  onClick: () => void;
  disabled?: boolean;
}

export const StyleButton = ({
  label,
  description,
  isSelected,
  selectedStyles,
  onClick,
  disabled = false,
}: StyleButtonProps) => {
  return (
    <Box
      as="button"
      type="button"
      disabled={disabled}
      onClick={onClick}
      padding="md"
      rounded="lg"
      className={`border-2 transition-all duration-200 hover:shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
        isSelected
          ? `${selectedStyles} shadow-sm`
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <Box className="text-center flex flex-col items-center gap-1">
        <Typography variant="body2" className="font-medium text-sm">
          {label}
        </Typography>
        <Typography
          variant="caption"
          color="muted"
          className="text-xs"
          as="div"
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

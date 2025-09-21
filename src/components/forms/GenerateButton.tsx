"use client";

import { useEffect } from "react";
import { Button, Box, Typography } from "@gmzh/react-ui";

interface GenerateButtonProps {
  onGenerate: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  prompt: string;
  style: string;
}

export const GenerateButton = ({
  onGenerate,
  isLoading = false,
  disabled = false,
  prompt,
}: GenerateButtonProps) => {
  const isDisabled = disabled || isLoading || prompt.length < 2 || prompt.length > 30;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isDisabled) {
        onGenerate();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onGenerate, isDisabled]);

  return (
    <Box className="text-center">
      <Button
        onClick={onGenerate}
        variant="contained"
        color="primary"
        size="large"
        loading={isLoading}
        loadingText="Generating icons..."
        disabled={isDisabled}
        className="w-full max-w-md px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg  transition-all duration-200 "
      >
        Generate Icons
      </Button>

      {!isLoading && (
        <Typography
          variant="caption"
          color="muted"
          className="mt-2 block text-xs"
        >
          {isDisabled && prompt.length > 0
            ? prompt.length < 2
              ? "Prompt too short"
              : "Prompt too long"
            : "This usually takes 30-60 seconds"}
        </Typography>
      )}
    </Box>
  );
};
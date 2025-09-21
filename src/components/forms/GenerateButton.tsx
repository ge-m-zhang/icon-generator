"use client";

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
  style,
}: GenerateButtonProps) => {
  const handleClick = () => {
    console.log("Generate button clicked:", {
      prompt,
      style,
      timestamp: new Date().toISOString(),
      isValid: prompt.length >= 2 && prompt.length <= 30
    });

    onGenerate();
  };

  const isDisabled = disabled || isLoading || prompt.length < 2 || prompt.length > 30;

  return (
    <Box className="text-center">
      <Button
        onClick={handleClick}
        variant="contained"
        color="primary"
        size="large"
        loading={isLoading}
        loadingText="Generating icons..."
        disabled={isDisabled}
        className="w-full max-w-md px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
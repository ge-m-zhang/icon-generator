"use client";

import { useState } from "react";
import { TextField, Box, Typography } from "@gmzh/react-ui";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  onEnterPress?: () => void;
}

export const PromptInput = ({
  value,
  onChange,
  disabled = false,
  error: externalError,
  onEnterPress,
}: PromptInputProps) => {
  const [internalError, setInternalError] = useState("");

  const validateInput = (input: string): string => {
    if (input.length < 2) {
      return "Prompt must be at least 2 characters";
    }
    if (input.length > 30) {
      return "Prompt must be 30 characters or less";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const validationError = validateInput(newValue);

    setInternalError(validationError);

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnterPress) {
      // Only trigger if the input is valid (no errors and meets length requirements)
      if (
        !displayError &&
        value.length >= 2 &&
        value.length <= 30 &&
        !disabled
      ) {
        onEnterPress();
      }
    }
  };

  const displayError = externalError || internalError;
  const isValid = !displayError && value.length >= 2 && value.length <= 30;

  return (
    <Box>
      <Typography variant="body2" className="mb-2 font-medium text-gray-700">
        What icons do you need?
      </Typography>

      <TextField
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="e.g., hockey, cooking, music"
        helperText={
          displayError ||
          `Describe what kind of icons you want (2-30 characters) • ${value.length}/30`
        }
        error={displayError}
        fullWidth
        size="medium"
        className="transition-colors focus:border-blue-500"
      />

      {value.length > 0 && !displayError && (
        <Typography variant="caption" className="mt-1 text-xs text-blue-600">
          {isValid ? "Ready to generate" : "Keep typing..."}
        </Typography>
      )}
    </Box>
  );
};

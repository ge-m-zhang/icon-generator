"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, Typography } from "@gmzh/react-ui";
import {
  IconGenerationRequest,
  PresetStyleId,
} from "@/lib/types/icon-generator-types";
import { StyleSelector } from "./StyleSelector";
import { PromptInput } from "./PromptInput";
import { GenerateButton } from "./GenerateButton";

interface IconGeneratorFormProps {
  onSubmit: (request: IconGenerationRequest) => void;
  isLoading?: boolean;
}

export const IconGeneratorForm = ({
  onSubmit,
  isLoading = false,
}: IconGeneratorFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<PresetStyleId>("Cartoon");
  const [error, setError] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim() || prompt.length < 2 || prompt.length > 30) {
      setError("Please enter a valid prompt (2-30 characters)");
      return;
    }

    setError("");

    onSubmit({
      prompt: prompt.trim(),
      style,
    });
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    if (error) setError("");
  };

  const handleStyleChange = (newStyle: PresetStyleId) => {
    setStyle(newStyle);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Box
        width="full"
        padding="xl"
        background="white"
        rounded="lg"
        shadow="lg"
        className="border border-gray-100"
      >
        {/* Header Section */}
        <Box margin="lg" className="text-center">
          <Typography
            variant="h2"
            align="center"
            className="text-blue-600 font-semibold mb-3"
          >
            AI Icon Generator
          </Typography>
          <Typography
            variant="body2"
            color="muted"
            align="center"
            className="max-w-lg mx-auto leading-relaxed whitespace-pre-line"
            as="div"
          >
            {`Generate consistent themed icons in 512×512 PNG format.
Choose your style and describe what you need.`}
          </Typography>
        </Box>

        {/* Style Examples Image */}
        <Box margin="lg" className="text-center">
          <Image
            src="/images/style-examples.png"
            alt="Style Examples - Different icon styles including Business, Cartoon, 3D Model, and Gradient"
            width={1600}
            height={500}
            className="mx-auto w-full h-auto rounded-lg shadow-md"
          />
        </Box>

        {/* Input Section */}
        <Box margin="lg" className="space-y-6">
          <PromptInput
            value={prompt}
            onChange={handlePromptChange}
            onEnterPress={handleGenerate}
            disabled={isLoading}
            error={error}
          />

          <StyleSelector
            value={style}
            onChange={handleStyleChange}
            disabled={isLoading}
          />

          <GenerateButton
            onGenerate={handleGenerate}
            isLoading={isLoading}
            prompt={prompt}
            style={style}
          />
        </Box>
      </Box>
    </div>
  );
};

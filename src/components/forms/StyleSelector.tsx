"use client";

import { Select, Box, Typography } from "@gmzh/react-ui";
import { PresetStyleId } from "@/lib/types/icon-generator-types";

interface StyleSelectorProps {
  value: PresetStyleId;
  onChange: (style: PresetStyleId) => void;
  disabled?: boolean;
}

const styleOptions = [
  {
    value: "Cartoon" as PresetStyleId,
    label: "Cartoon",
    description: "Friendly rounded proportions with soft shading",
  },
  {
    value: "ThreeDModel" as PresetStyleId,
    label: "3D Model",
    description: "Beveled edges with studio lighting",
  },
  {
    value: "Gradient" as PresetStyleId,
    label: "Gradient",
    description: "Smooth gradient fills with minimal outline",
  },
];

export const StyleSelector = ({
  value,
  onChange,
  disabled = false,
}: StyleSelectorProps) => {
  const handleChange = (newValue: string) => {
    const selectedStyle = newValue as PresetStyleId;
    onChange(selectedStyle);
  };

  return (
    <Box>
      <Typography variant="body2" className="mb-2 font-medium text-gray-700">
        Icon Style
      </Typography>

      <Select
        options={styleOptions.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description,
        }))}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Choose your style"
        helperText="Each style creates distinct visual characteristics for your icons"
        fullWidth
      />
    </Box>
  );
};

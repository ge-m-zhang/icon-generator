"use client";

import { Box, Typography } from "@gmzh/react-ui";

export const Footer = () => {
  return (
    <Box 
      as="footer" 
      className="fixed bottom-0 left-0 right-0 w-full border-t border-gray-200 bg-white/95 backdrop-blur-sm z-10"
    >
      <Box className="flex items-center justify-center w-full h-full px-4 py-2">
        <Typography 
          variant="body2" 
          color="muted"
          align="center"
          className="text-xs"
        >
          Built by{" "}
          <a
            href="https://github.com/ge-m-zhang"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium underline decoration-1 underline-offset-2 transition-colors duration-200"
          >
            GMZhang
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

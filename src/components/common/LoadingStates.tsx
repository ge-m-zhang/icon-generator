"use client";

import { Spinner, Box, Typography, Flex } from "@gmzh/react-ui";

interface LoadingStatesProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const LoadingStates = ({
  isLoading,
  error,
  children,
}: LoadingStatesProps) => {
  if (error) {
    return (
      <Box padding="lg">
        <Flex justify="center">
          <Box
            padding="lg"
            background="danger"
            rounded="md"
            className="border border-red-200 dark:border-red-800"
          >
            <Typography variant="body1" color="danger" bold>
              Error generating icons
            </Typography>
            <Typography variant="body2" color="danger">
              {error}
            </Typography>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box padding="lg">
        <Flex direction="column" align="center" gap="md">
          <Spinner size="large" color="primary" />
          <Typography variant="body1" color="muted">
            Generating your icons...
          </Typography>
        </Flex>
      </Box>
    );
  }

  return <>{children}</>;
};

export const EmptyState = () => {
  return (
    <Box className="flex-1 flex items-center justify-center min-h-[400px] p-6">
      <Box
        padding="l"
        background="gray"
        rounded="lg"
        className="border border-gray-200"
      >
        <Typography variant="h4" color="muted" align="center">
          Enter a prompt above to generate icons
        </Typography>
      </Box>
    </Box>
  );
};

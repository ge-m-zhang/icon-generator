"use client";

import { IconGeneratorForm } from "@/components/forms/IconGeneratorForm";
import { IconGrid } from "@/components/display/IconGrid";
import { LoadingStates, EmptyState } from "@/components/common/LoadingStates";
import { useIconGeneration } from "@/lib/hooks/useIconGeneration";
import { Box, Flex } from "@gmzh/react-ui";

const Home = () => {
  const { generateIcons, data, isLoading, isError, error } =
    useIconGeneration();

  const hasResults = data?.success && data.images.length > 0;

  return (
    <Box background="gray" className="page-container">
      <Flex className="content-wrapper">
        {/* Container 1: Input and Search */}
        <Box className="input-container">
          <IconGeneratorForm onSubmit={generateIcons} isLoading={isLoading} />
        </Box>

        {/* Container 2: Result Display */}
        <Box className="result-container">
          <Box
            width="full"
            padding="xl"
            background="white"
            rounded="lg"
            shadow="lg"
            className="border border-gray-100 min-h-[600px] flex flex-col"
          >
            <div className="flex-1 flex flex-col justify-start">
              <LoadingStates
                isLoading={isLoading}
                error={isError ? error?.message : null}
              >
                {hasResults ? <IconGrid icons={data.images} /> : <EmptyState />}
              </LoadingStates>
            </div>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;

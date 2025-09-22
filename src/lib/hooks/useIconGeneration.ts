import { useMutation } from "@tanstack/react-query";
import {
  IconGenerationRequest,
  IconGenerationResponse,
} from "@/lib/types/icon-generator-types";
import { apiClient, ApiError } from "@/lib/services/api-client";

export interface UseIconGenerationResult {
  generateIcons: (request: IconGenerationRequest) => void;
  data: IconGenerationResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export const useIconGeneration = (): UseIconGenerationResult => {
  const mutation = useMutation({
    mutationFn: (request: IconGenerationRequest) => {
      return apiClient.generateIcons(request);
    },
    onError: (error: ApiError) => {
      console.error("Icon generation failed:", error);
    },
    onSuccess: (data) => {
      // Icons generated successfully
    },
  });

  return {
    generateIcons: mutation.mutate,
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

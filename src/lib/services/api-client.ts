import {
  IconGenerationRequest,
  IconGenerationResponse,
} from "@/lib/types/icon-generator-types";
import logger from "@/lib/config/logger";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error: ApiError = {
        message:
          errorData?.error ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: errorData?.code,
      };
      throw error;
    }

    return response.json();
  }

  async generateIcons(
    request: IconGenerationRequest
  ): Promise<IconGenerationResponse> {
    logger.debug('API Client: Starting icon generation', { request });

    const response = await fetch(`${this.baseUrl}/api/generate-icons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    logger.debug('API Client: Received response', { status: response.status, statusText: response.statusText });

    const result = await this.handleResponse<IconGenerationResponse>(response);
    return result;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

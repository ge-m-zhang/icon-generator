import OpenAI from "openai";

export interface SimpleOpenAIConfig {
  apiKey?: string;
  timeout?: number;
}

export interface CompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Simple OpenAI client with basic functionality only
 */
export class SimpleOpenAIClient {
  private openai?: OpenAI;

  constructor(config?: SimpleOpenAIConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        timeout: config?.timeout || 10000,
      });
    }
  }

  isAvailable(): boolean {
    return !!this.openai;
  }

  async createCompletion(request: CompletionRequest): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI client not available");
    }

    const { systemPrompt, userPrompt, temperature = 0.3, maxTokens = 200 } = request;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return content;
  }
}

export function createSimpleOpenAIClient(config?: SimpleOpenAIConfig): SimpleOpenAIClient {
  return new SimpleOpenAIClient(config);
}
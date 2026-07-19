import { AgentRuntimeError } from "../types/errors.js";
import type { ProviderMessage, ProviderRequest, ProviderResponse } from "../types/provider.js";
import type { Provider } from "./Provider.js";

export interface OpenAIProviderOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  fetch?: typeof fetch;
}

type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIChatCompletionResponse = {
  model?: string;
  choices: Array<{
    message?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export class OpenAIProvider implements Provider {
  readonly name = "openai";

  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly model: string;

  constructor(options: OpenAIProviderOptions) {
    if (!options?.apiKey || options.apiKey.trim().length === 0) {
      throw new AgentRuntimeError("OpenAIProvider requires a non-empty apiKey.");
    }

    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.baseURL = options.baseURL ?? DEFAULT_BASE_URL;
    this.fetchImplementation = options.fetch ?? fetch;
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    try {
      const response = await this.fetchImplementation(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: mapProviderRequestToOpenAIMessages(request),
        }),
      });

      const body = (await response.json()) as OpenAIChatCompletionResponse;

      if (!response.ok) {
        throw new AgentRuntimeError(
          `OpenAIProvider API request failed: ${body.error?.message ?? response.statusText}`,
        );
      }

      const choice = body.choices[0];

      return {
        text: choice?.message?.content ?? "",
        metadata: {
          provider: this.name,
          model: body.model ?? this.model,
          usage: body.usage
            ? {
                inputTokens: body.usage.prompt_tokens,
                outputTokens: body.usage.completion_tokens,
                totalTokens: body.usage.total_tokens,
              }
            : undefined,
          finishReason: choice?.finish_reason ?? undefined,
        },
      };
    } catch (error) {
      if (error instanceof AgentRuntimeError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown OpenAI API error.";
      throw new AgentRuntimeError(`OpenAIProvider generate failed: ${message}`);
    }
  }
}

export function mapProviderRequestToOpenAIMessages(request: ProviderRequest): OpenAIChatMessage[] {
  if (request.messages && request.messages.length > 0) {
    return request.messages.map(mapProviderMessageToOpenAIMessage);
  }

  const messages: OpenAIChatMessage[] = [];

  if (request.instructions && request.instructions.trim().length > 0) {
    messages.push({ role: "system", content: request.instructions });
  }

  messages.push({ role: "user", content: request.input });

  return messages;
}

function mapProviderMessageToOpenAIMessage(message: ProviderMessage): OpenAIChatMessage {
  return {
    role: message.role,
    content: message.content,
  };
}

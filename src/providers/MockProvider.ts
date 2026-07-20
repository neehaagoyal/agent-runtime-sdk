import type { ProviderRequest, ProviderResponse } from "../types/provider.js";
import type { ToolCall } from "../types/tool.js";
import type { Provider } from "./Provider.js";

export interface MockProviderOptions {
  responseText?: string;
  model?: string;
  toolCalls?: ToolCall[];
}

export class MockProvider implements Provider {
  readonly name = "mock";

  private readonly responseText: string;
  private readonly model: string;
  private readonly toolCalls: ToolCall[];

  constructor(options: MockProviderOptions = {}) {
    this.responseText = options.responseText ?? "Mock provider response";
    this.model = options.model ?? "mock-model";
    this.toolCalls = options.toolCalls ?? [];
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const inputTokens = countTokens(request.input);
    const outputTokens = countTokens(this.responseText);

    return {
      text: this.responseText,
      metadata: {
        provider: this.name,
        model: this.model,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        finishReason: this.toolCalls.length > 0 ? "tool_calls" : "stop",
      },
      ...(this.toolCalls.length > 0 ? { toolCalls: this.toolCalls } : {}),
    };
  }
}

function countTokens(text: string): number {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return 0;
  }

  return trimmed.split(/\s+/u).length;
}

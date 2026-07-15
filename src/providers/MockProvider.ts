import type { ProviderRequest, ProviderResponse } from "../types/provider.js";
import type { Provider } from "./Provider.js";

export interface MockProviderOptions {
  responseText?: string;
  model?: string;
}

export class MockProvider implements Provider {
  readonly name = "mock";

  private readonly responseText: string;
  private readonly model: string;

  constructor(options: MockProviderOptions = {}) {
    this.responseText = options.responseText ?? "Mock provider response";
    this.model = options.model ?? "mock-model";
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
        finishReason: "stop",
      },
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

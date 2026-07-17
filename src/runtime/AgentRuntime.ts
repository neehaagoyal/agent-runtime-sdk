import type { Provider } from "../providers/Provider.js";
import { AgentRuntimeError } from "../types/errors.js";
import type { ProviderRequest } from "../types/provider.js";
import type { AgentRunInput, AgentRunResponse } from "../types/runtime.js";

export interface AgentRuntimeOptions {
  provider: Provider;
}

export class AgentRuntime {
  private readonly provider: Provider;

  constructor(options: AgentRuntimeOptions) {
    if (!options?.provider) {
      throw new AgentRuntimeError("AgentRuntime requires a provider.");
    }

    this.provider = options.provider;
  }

  async run(input: AgentRunInput): Promise<AgentRunResponse> {
    this.validateInput(input);

    const request: ProviderRequest = {
      input: input.input,
      instructions: input.instructions,
      context: input.context,
    };

    const response = await this.provider.generate(request);

    return {
      text: response.text,
      metadata: {
        provider: response.metadata.provider,
        model: response.metadata.model,
        usage: response.metadata.usage,
        finishReason: response.metadata.finishReason,
      },
    };
  }

  private validateInput(input: AgentRunInput): void {
    if (typeof input?.input !== "string" || input.input.trim().length === 0) {
      throw new AgentRuntimeError("AgentRuntime input.input must be a non-empty string.");
    }
  }
}

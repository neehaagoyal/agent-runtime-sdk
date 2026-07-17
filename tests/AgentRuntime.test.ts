import { describe, expect, it } from "vitest";
import { AgentRuntime, AgentRuntimeError, MockProvider } from "../src/index.js";
import type { Provider, ProviderRequest, ProviderResponse } from "../src/index.js";

class CapturingProvider implements Provider {
  readonly name = "capturing-provider";
  requests: ProviderRequest[] = [];

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    this.requests.push(request);

    return {
      text: "Captured provider response",
      metadata: {
        provider: this.name,
        model: "capturing-model",
        usage: {
          inputTokens: 2,
          outputTokens: 3,
          totalTokens: 5,
        },
        finishReason: "stop",
      },
    };
  }
}

describe("AgentRuntime", () => {
  it("initializes with a configured provider", () => {
    const provider = new MockProvider();
    const runtime = new AgentRuntime({ provider });

    expect(runtime).toBeInstanceOf(AgentRuntime);
  });

  it("throws a clear error when no provider is supplied", () => {
    const createRuntimeWithoutProvider = () =>
      new AgentRuntime({ provider: undefined as unknown as Provider });

    expect(createRuntimeWithoutProvider).toThrow(AgentRuntimeError);
    expect(createRuntimeWithoutProvider).toThrow("AgentRuntime requires a provider.");
  });

  it("validates input.input is a non-empty string", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: "" })).rejects.toThrow(AgentRuntimeError);
    await expect(runtime.run({ input: "   " })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("forwards input, instructions, and context to the configured provider", async () => {
    const provider = new CapturingProvider();
    const runtime = new AgentRuntime({ provider });
    const request: ProviderRequest = {
      input: "Hello provider",
      instructions: "Reply briefly",
      context: { traceId: "trace_123" },
    };

    await runtime.run(request);

    expect(provider.requests).toEqual([request]);
  });

  it("returns normalized text and metadata from the provider response", async () => {
    const provider = new CapturingProvider();
    const runtime = new AgentRuntime({ provider });

    const response = await runtime.run({ input: "hello runtime" });

    expect(response).toEqual({
      text: "Captured provider response",
      metadata: {
        provider: "capturing-provider",
        model: "capturing-model",
        usage: {
          inputTokens: 2,
          outputTokens: 3,
          totalTokens: 5,
        },
        finishReason: "stop",
      },
    });
  });
});

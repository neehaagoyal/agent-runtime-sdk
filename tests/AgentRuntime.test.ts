import { describe, expect, it, vi } from "vitest";
import { AgentRuntime, AgentRuntimeError, MockProvider } from "../src/index.js";
import type { Provider, ProviderRequest } from "../src/index.js";

describe("AgentRuntime", () => {
  it("initializes with a MockProvider", () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    expect(runtime).toBeInstanceOf(AgentRuntime);
  });

  it("throws a clear error when no provider is supplied", () => {
    expect(() => new AgentRuntime({ provider: undefined as unknown as Provider })).toThrow(
      AgentRuntimeError,
    );
    expect(() => new AgentRuntime({ provider: undefined as unknown as Provider })).toThrow(
      "AgentRuntime requires a provider.",
    );
  });

  it("validates input.input is a non-empty string", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: "" })).rejects.toThrow(AgentRuntimeError);
    await expect(runtime.run({ input: "   " })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("forwards input, instructions, and context to the provider", async () => {
    const generate = vi.fn(async () => ({
      text: "Provider response",
      metadata: {
        provider: "test-provider",
        model: "test-model",
        usage: { inputTokens: 2, outputTokens: 2, totalTokens: 4 },
        finishReason: "stop",
      },
    }));
    const provider: Provider = { name: "test-provider", generate };
    const runtime = new AgentRuntime({ provider });
    const request: ProviderRequest = {
      input: "Hello provider",
      instructions: "Reply briefly",
      context: { traceId: "trace_123" },
    };

    await runtime.run(request);

    expect(generate).toHaveBeenCalledWith(request);
  });

  it("returns normalized text and SDK-level metadata", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    const response = await runtime.run({ input: "hello runtime" });

    expect(response).toEqual({
      text: "Mock provider response",
      metadata: {
        provider: "mock",
        model: "mock-model",
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

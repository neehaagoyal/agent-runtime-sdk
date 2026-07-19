import { describe, expect, it, vi } from "vitest";
import { AgentRuntime, AgentRuntimeError, MockProvider } from "../src/index.js";
import type { Provider, ProviderRequest, ProviderResponse } from "../src/index.js";

class CapturingProvider implements Provider {
  readonly name = "capturing-provider";
  readonly requests: ProviderRequest[] = [];

  constructor(private readonly response: ProviderResponse) {}

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    this.requests.push(request);

    return this.response;
  }
}

describe("AgentRuntime", () => {
  it("initializes with a configured provider", async () => {
    const provider = new MockProvider({ responseText: "Initialized runtime response" });
    const runtime = new AgentRuntime({ provider });

    await expect(runtime.run({ input: "hello" })).resolves.toMatchObject({
      text: "Initialized runtime response",
      metadata: {
        provider: "mock",
      },
    });
  });

  it("throws a clear error when no provider is supplied", () => {
    expect(() => new AgentRuntime({ provider: undefined as unknown as Provider })).toThrow(
      AgentRuntimeError,
    );
    expect(() => new AgentRuntime({ provider: undefined as unknown as Provider })).toThrow(
      "AgentRuntime requires a provider.",
    );
  });

  it("throws a clear error when the input object is missing", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run(undefined as unknown as { input: string })).rejects.toThrow(
      AgentRuntimeError,
    );
    await expect(runtime.run(undefined as unknown as { input: string })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("throws a clear error when input.input is empty", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: "" })).rejects.toThrow(AgentRuntimeError);
    await expect(runtime.run({ input: "" })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("throws a clear error when input.input is whitespace only", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: "   " })).rejects.toThrow(AgentRuntimeError);
    await expect(runtime.run({ input: "   " })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("throws a clear error when input.input is not a string", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: 42 } as unknown as { input: string })).rejects.toThrow(
      AgentRuntimeError,
    );
    await expect(runtime.run({ input: 42 } as unknown as { input: string })).rejects.toThrow(
      "AgentRuntime input.input must be a non-empty string.",
    );
  });

  it("forwards input, instructions, and context to the configured provider", async () => {
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
      context: { traceId: "trace_123", nested: { enabled: true } },
    };

    await runtime.run(request);

    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledWith(request);
  });

  it("forwards input-only requests with optional fields left undefined", async () => {
    const generate = vi.fn(async () => ({
      text: "Provider response",
      metadata: {
        provider: "test-provider",
      },
    }));
    const provider: Provider = { name: "test-provider", generate };
    const runtime = new AgentRuntime({ provider });

    await runtime.run({ input: "Hello provider" });

    expect(generate).toHaveBeenCalledWith({
      input: "Hello provider",
      instructions: undefined,
      context: undefined,
    });
  });

  it("normalizes provider response metadata into the SDK response shape", async () => {
    const provider = new CapturingProvider({
      text: "Captured provider response",
      metadata: {
        provider: "capturing-provider",
        model: "capture-model-v1",
        usage: {
          inputTokens: 4,
          outputTokens: 3,
          totalTokens: 7,
        },
        finishReason: "length",
      },
    });
    const runtime = new AgentRuntime({ provider });

    const response = await runtime.run({
      input: "Normalize this response",
      instructions: "Use normalized metadata",
      context: { requestId: "req_123" },
    });

    expect(provider.requests).toEqual([
      {
        input: "Normalize this response",
        instructions: "Use normalized metadata",
        context: { requestId: "req_123" },
      },
    ]);
    expect(response).toEqual({
      text: "Captured provider response",
      metadata: {
        provider: "capturing-provider",
        model: "capture-model-v1",
        usage: {
          inputTokens: 4,
          outputTokens: 3,
          totalTokens: 7,
        },
        finishReason: "length",
      },
    });
  });

  it("preserves normalized metadata when optional provider metadata is omitted", async () => {
    const provider = new CapturingProvider({
      text: "Minimal provider response",
      metadata: {
        provider: "minimal-provider",
      },
    });
    const runtime = new AgentRuntime({ provider });

    const response = await runtime.run({ input: "minimal metadata" });

    expect(response).toEqual({
      text: "Minimal provider response",
      metadata: {
        provider: "minimal-provider",
        model: undefined,
        usage: undefined,
        finishReason: undefined,
      },
    });
  });

  it("preserves OpenAI-style provider metadata through runtime normalization", async () => {
    const provider = new CapturingProvider({
      text: "OpenAI-style runtime response",
      metadata: {
        provider: "openai",
        model: "gpt-test",
        usage: { inputTokens: 6, outputTokens: 4, totalTokens: 10 },
        finishReason: "stop",
      },
    });
    const runtime = new AgentRuntime({ provider });

    const response = await runtime.run({
      input: "Hello OpenAI provider",
      instructions: "Reply briefly",
      context: { requestId: "req_openai" },
    });

    expect(provider.requests).toEqual([
      {
        input: "Hello OpenAI provider",
        instructions: "Reply briefly",
        context: { requestId: "req_openai" },
      },
    ]);
    expect(response).toEqual({
      text: "OpenAI-style runtime response",
      metadata: {
        provider: "openai",
        model: "gpt-test",
        usage: { inputTokens: 6, outputTokens: 4, totalTokens: 10 },
        finishReason: "stop",
      },
    });
  });

  it("returns normalized text and SDK-level metadata from MockProvider", async () => {
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

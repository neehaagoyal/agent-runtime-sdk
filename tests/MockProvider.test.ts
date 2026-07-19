import { describe, expect, it } from "vitest";
import { MockProvider } from "../src/index.js";
import type { Provider } from "../src/index.js";

describe("MockProvider", () => {
  it("implements the Provider interface", () => {
    const provider: Provider = new MockProvider();

    expect(provider.name).toBe("mock");
    expect(provider.generate).toBeTypeOf("function");
  });

  it("returns a predictable provider response", async () => {
    const provider = new MockProvider();

    const response = await provider.generate({
      input: "Hello mock provider",
      instructions: "Reply predictably",
      context: { traceId: "trace_123" },
    });

    expect(response).toEqual({
      text: "Mock provider response",
      metadata: {
        provider: "mock",
        model: "mock-model",
        usage: {
          inputTokens: 3,
          outputTokens: 3,
          totalTokens: 6,
        },
        finishReason: "stop",
      },
    });
  });

  it("exposes the stable mock provider name", () => {
    const provider = new MockProvider();

    expect(provider.name).toBe("mock");
  });

  it("returns deterministic text across repeated calls", async () => {
    const provider = new MockProvider();

    const first = await provider.generate({ input: "first request" });
    const second = await provider.generate({ input: "second request with different text" });

    expect(first.text).toBe("Mock provider response");
    expect(second.text).toBe("Mock provider response");
  });

  it("includes usage metadata based on input and output token counts", async () => {
    const provider = new MockProvider({ responseText: "short response" });

    const response = await provider.generate({ input: "count these input tokens" });

    expect(response.metadata.usage).toEqual({
      inputTokens: 4,
      outputTokens: 2,
      totalTokens: 6,
    });
  });

  it("includes a finish reason", async () => {
    const provider = new MockProvider();

    const response = await provider.generate({ input: "finish reason" });

    expect(response.metadata.finishReason).toBe("stop");
  });

  it("supports deterministic custom response text and model metadata", async () => {
    const provider = new MockProvider({
      responseText: "Custom test response",
      model: "mock-custom-model",
    });

    const response = await provider.generate({ input: "Hello" });

    expect(response.text).toBe("Custom test response");
    expect(response.metadata).toMatchObject({
      provider: "mock",
      model: "mock-custom-model",
      finishReason: "stop",
    });
    expect(response.metadata.usage).toEqual({
      inputTokens: 1,
      outputTokens: 3,
      totalTokens: 4,
    });
  });
});

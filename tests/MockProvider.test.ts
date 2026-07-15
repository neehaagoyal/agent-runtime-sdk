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

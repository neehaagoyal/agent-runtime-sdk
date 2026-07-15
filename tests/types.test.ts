import { describe, expect, it } from "vitest";
import { AgentRuntimeError } from "../src/index.js";
import type { AgentRunInput, AgentRunResponse, ProviderRequest, ProviderResponse } from "../src/index.js";

describe("public type exports", () => {
  it("supports runtime and provider request/response shapes", () => {
    const input: AgentRunInput = {
      input: "Hello",
      instructions: "Reply warmly",
      context: { userId: "user_123" },
    };

    const providerRequest: ProviderRequest = input;

    const providerResponse: ProviderResponse = {
      text: "Hi there!",
      metadata: {
        provider: "mock",
        model: "mock-model",
        usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
        finishReason: "stop",
      },
    };

    const runtimeResponse: AgentRunResponse = providerResponse;

    expect(providerRequest).toEqual(input);
    expect(runtimeResponse.text).toBe("Hi there!");
    expect(runtimeResponse.metadata.provider).toBe("mock");
  });

  it("exports the base runtime error", () => {
    expect(new AgentRuntimeError("Example error")).toBeInstanceOf(Error);
  });
});

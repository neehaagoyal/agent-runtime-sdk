import { describe, expect, it, vi } from "vitest";
import { MockProvider, OpenAIProvider } from "../src/index.js";
import type { Provider } from "../src/index.js";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
}

const providers: Array<[string, Provider]> = [
  ["MockProvider", new MockProvider()],
  [
    "OpenAIProvider",
    new OpenAIProvider({
      apiKey: "test-key",
      fetch: vi.fn(async () =>
        jsonResponse({
          model: "gpt-contract",
          choices: [{ message: { content: "Contract response" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 },
        }),
      ),
    }),
  ],
];

describe.each(providers)("provider contract: %s", (_label, provider) => {
  it("has a stable name", () => {
    expect(provider.name).toEqual(expect.any(String));
    expect(provider.name.length).toBeGreaterThan(0);
  });

  it("returns normalized text and metadata", async () => {
    const response = await provider.generate({ input: "Hello contract" });

    expect(response.text).toEqual(expect.any(String));
    expect(response.metadata.provider).toBe(provider.name);

    if (response.metadata.usage) {
      expect(response.metadata.usage.inputTokens).toEqual(expect.any(Number));
      expect(response.metadata.usage.outputTokens).toEqual(expect.any(Number));
      expect(response.metadata.usage.totalTokens).toEqual(expect.any(Number));
    }

    if (response.metadata.finishReason) {
      expect(response.metadata.finishReason).toEqual(expect.any(String));
    }
  });
});

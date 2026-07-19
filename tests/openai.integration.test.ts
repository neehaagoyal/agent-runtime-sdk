import { describe, expect, it } from "vitest";
import { OpenAIProvider } from "../src/index.js";

const apiKey = process.env.OPENAI_API_KEY;
const describeLive = apiKey ? describe : describe.skip;

describeLive("OpenAIProvider live integration", () => {
  it("returns a normalized response from the live OpenAI API", async () => {
    const provider = new OpenAIProvider({ apiKey, model: process.env.OPENAI_MODEL });

    const response = await provider.generate({
      input: "Reply with exactly one short sentence about SDK integration tests.",
      instructions: "Be concise.",
    });

    expect(response.text).toEqual(expect.any(String));
    expect(response.metadata.provider).toBe("openai");
    expect(response.metadata.model).toEqual(expect.any(String));

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

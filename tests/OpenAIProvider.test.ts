import { describe, expect, it, vi } from "vitest";
import {
  AgentRuntimeError,
  OpenAIProvider,
  mapProviderRequestToOpenAIMessages,
  mapToolDefinitionToOpenAITool,
} from "../src/index.js";

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("OpenAIProvider", () => {
  it("throws a clear error when constructed without an API key", () => {
    expect(() => new OpenAIProvider({ apiKey: "" })).toThrow(AgentRuntimeError);
    expect(() => new OpenAIProvider({ apiKey: "" })).toThrow(
      "OpenAIProvider requires a non-empty apiKey.",
    );
  });

  it("maps instructions and input into OpenAI-compatible messages", () => {
    expect(
      mapProviderRequestToOpenAIMessages({ input: "Hello", instructions: "Be brief" }),
    ).toEqual([
      { role: "system", content: "Be brief" },
      { role: "user", content: "Hello" },
    ]);
  });

  it("preserves explicit provider-neutral messages", () => {
    expect(
      mapProviderRequestToOpenAIMessages({
        input: "ignored when messages are present",
        messages: [
          { role: "system", content: "Rules" },
          { role: "user", content: "Question" },
          { role: "assistant", content: "Prior answer" },
        ],
      }),
    ).toEqual([
      { role: "system", content: "Rules" },
      { role: "user", content: "Question" },
      { role: "assistant", content: "Prior answer" },
    ]);
  });

  it("normalizes OpenAI chat completion responses", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        model: "gpt-test",
        choices: [{ message: { content: "OpenAI response" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
      }),
    );
    const provider = new OpenAIProvider({ apiKey: "test-key", model: "gpt-test", fetch: fetchMock });

    await expect(provider.generate({ input: "Hello", instructions: "Reply" })).resolves.toEqual({
      text: "OpenAI response",
      metadata: {
        provider: "openai",
        model: "gpt-test",
        usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 },
        finishReason: "stop",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-test",
        messages: [
          { role: "system", content: "Reply" },
          { role: "user", content: "Hello" },
        ],
      }),
    });
  });


  it("maps SDK tool definitions into OpenAI tool definitions", () => {
    expect(
      mapToolDefinitionToOpenAITool({
        name: "getOrderStatus",
        description: "Look up order status.",
        parameters: { type: "object", properties: { orderId: { type: "string" } } },
      }),
    ).toEqual({
      type: "function",
      function: {
        name: "getOrderStatus",
        description: "Look up order status.",
        parameters: { type: "object", properties: { orderId: { type: "string" } } },
      },
    });
  });

  it("sends SDK tool definitions and normalizes OpenAI tool calls", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        model: "gpt-test",
        choices: [
          {
            message: {
              content: "",
              tool_calls: [
                {
                  id: "call_1",
                  function: { name: "getOrderStatus", arguments: '{"orderId":"123"}' },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
      }),
    );
    const provider = new OpenAIProvider({ apiKey: "test-key", model: "gpt-test", fetch: fetchMock });

    await expect(
      provider.generate({
        input: "Where is order 123?",
        tools: [{ name: "getOrderStatus", description: "Look up order status." }],
      }),
    ).resolves.toMatchObject({
      toolCalls: [{ id: "call_1", name: "getOrderStatus", arguments: '{"orderId":"123"}' }],
      metadata: { finishReason: "tool_calls" },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      tools: [
        {
          type: "function",
          function: {
            name: "getOrderStatus",
            description: "Look up order status.",
            parameters: { type: "object", properties: {} },
          },
        },
      ],
    });
  });

  it("wraps failed API responses in an SDK error", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ error: { message: "Invalid API key" }, choices: [] }, { status: 401 }),
    );
    const provider = new OpenAIProvider({ apiKey: "bad-key", fetch: fetchMock });

    await expect(provider.generate({ input: "Hello" })).rejects.toThrow(AgentRuntimeError);
    await expect(provider.generate({ input: "Hello" })).rejects.toThrow(
      "OpenAIProvider API request failed: Invalid API key",
    );
  });
});

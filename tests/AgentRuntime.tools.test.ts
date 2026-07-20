import { describe, expect, it } from "vitest";
import { AgentRuntime, MockProvider, ToolRegistry } from "../src/index.js";

describe("AgentRuntime tool calling", () => {
  it("passes registered tool definitions to the provider and records executed tools", async () => {
    const tools = new ToolRegistry([
      {
        definition: {
          name: "getOrderStatus",
          description: "Look up order status.",
          parameters: { type: "object", properties: { orderId: { type: "string" } } },
        },
        execute: ({ orderId }) => ({ orderId, status: "shipped" }),
      },
    ]);
    const provider = new MockProvider({
      responseText: "Order lookup complete.",
      toolCalls: [{ id: "call_order", name: "getOrderStatus", arguments: { orderId: "123" } }],
    });
    const runtime = new AgentRuntime({ provider, tools });

    const response = await runtime.run({ input: "Where is order 123?" });

    expect(response.text).toBe("Order lookup complete.");
    expect(response.metadata.toolsUsed).toEqual([
      {
        id: "call_order",
        name: "getOrderStatus",
        arguments: { orderId: "123" },
        success: true,
        output: { orderId: "123", status: "shipped" },
      },
    ]);
  });

  it("keeps no-tool runtime behavior backward compatible with an empty toolsUsed list", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    await expect(runtime.run({ input: "hello" })).resolves.toMatchObject({
      metadata: { toolsUsed: [] },
    });
  });
});

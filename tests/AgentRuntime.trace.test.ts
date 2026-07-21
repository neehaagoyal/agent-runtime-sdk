import { describe, expect, it } from "vitest";
import { AgentRuntime } from "../src/runtime/AgentRuntime.js";
import { MockProvider } from "../src/providers/MockProvider.js";

describe("AgentRuntime traces", () => {
  it("includes ordered runtime and provider events on successful runs", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider({ responseText: "hello" }) });

    const result = await runtime.run({ input: "Say hello" });

    expect(result.metadata.trace.runId).toMatch(/^run-/u);
    expect(result.metadata.trace.events.map((event) => event.type)).toEqual([
      "runtime.start",
      "provider.request",
      "provider.response",
      "runtime.end",
    ]);
    expect(result.metadata.trace.events.at(-1)).toMatchObject({ type: "runtime.end", success: true });
  });

  it("records tool call events in provider and tool order", async () => {
    const runtime = new AgentRuntime({
      provider: new MockProvider({ toolCalls: [{ id: "call-1", name: "echo", arguments: { value: "hi" } }] }),
      tools: [{ definition: { name: "echo", description: "Echo input" }, execute: async (args) => args.value }],
    });

    const result = await runtime.run({ input: "Use a tool" });

    expect(result.metadata.toolsUsed).toEqual([
      { id: "call-1", name: "echo", arguments: { value: "hi" }, success: true, output: "hi" },
    ]);
    expect(result.metadata.trace.events.map((event) => event.type)).toEqual([
      "runtime.start",
      "provider.request",
      "provider.response",
      "tool.call.start",
      "tool.call.result",
      "runtime.end",
    ]);
    expect(result.metadata.trace.events[4]).toMatchObject({
      type: "tool.call.result",
      toolCallId: "call-1",
      toolName: "echo",
      success: true,
    });
  });
});

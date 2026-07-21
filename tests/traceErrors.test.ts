import { describe, expect, it } from "vitest";
import { AgentRuntime } from "../src/runtime/AgentRuntime.js";
import type { Provider } from "../src/providers/Provider.js";
import { MockProvider } from "../src/providers/MockProvider.js";
import type { ExecutionTrace } from "../src/types/trace.js";

function traceFrom(error: unknown): ExecutionTrace {
  return (error as { trace: ExecutionTrace }).trace;
}

describe("trace error capture", () => {
  it("attaches a normalized trace when provider calls fail", async () => {
    const provider: Provider = { name: "broken", generate: async () => { throw new Error("provider down"); } };
    const runtime = new AgentRuntime({ provider });

    await expect(runtime.run({ input: "hello" })).rejects.toThrow("provider down");

    try {
      await runtime.run({ input: "hello" });
    } catch (error) {
      const trace = traceFrom(error);
      expect(trace.events.map((event) => event.type)).toEqual([
        "runtime.start",
        "provider.request",
        "runtime.error",
        "runtime.end",
      ]);
      expect(trace.events[2]).toMatchObject({ type: "runtime.error", error: { name: "Error", message: "provider down" } });
    }
  });

  it("records invalid input errors", async () => {
    const runtime = new AgentRuntime({ provider: new MockProvider() });

    try {
      await runtime.run({ input: "" });
    } catch (error) {
      expect(traceFrom(error).events.map((event) => event.type)).toEqual([
        "runtime.start",
        "runtime.error",
        "runtime.end",
      ]);
    }
  });

  it("records failed tool execution results", async () => {
    const runtime = new AgentRuntime({
      provider: new MockProvider({ toolCalls: [{ id: "call-1", name: "explode", arguments: {} }] }),
      tools: [{ definition: { name: "explode", description: "Fails" }, execute: async () => { throw new Error("boom"); } }],
    });

    const result = await runtime.run({ input: "Use tool" });
    expect(result.metadata.trace.events[4]).toMatchObject({
      type: "tool.call.result",
      success: false,
      error: { name: "Error", message: 'Tool "explode" failed: boom' },
    });
  });
});

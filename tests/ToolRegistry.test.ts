import { describe, expect, it } from "vitest";
import { AgentRuntimeError, ToolRegistry } from "../src/index.js";
import type { Tool } from "../src/index.js";

const tool: Tool = {
  definition: { name: "lookupOrder", description: "Look up an order." },
  execute: () => ({ status: "shipped" }),
};

describe("ToolRegistry", () => {
  it("registers and retrieves tools by name", () => {
    const registry = new ToolRegistry().register(tool);

    expect(registry.has("lookupOrder")).toBe(true);
    expect(registry.get("lookupOrder")).toBe(tool);
  });

  it("accepts tools at construction time and lists definitions without handlers", () => {
    const registry = new ToolRegistry([tool]);

    expect(registry.list()).toEqual([tool.definition]);
    expect(registry.list()[0]).not.toHaveProperty("execute");
  });

  it("rejects duplicate tool names", () => {
    expect(() => new ToolRegistry([tool, tool])).toThrow(AgentRuntimeError);
    expect(() => new ToolRegistry([tool, tool])).toThrow(
      'ToolRegistry already contains a tool named "lookupOrder".',
    );
  });

  it("rejects invalid tools", () => {
    expect(() => new ToolRegistry([{ ...tool, execute: undefined } as unknown as Tool])).toThrow(
      "ToolRegistry tool.execute must be a function.",
    );
  });
});

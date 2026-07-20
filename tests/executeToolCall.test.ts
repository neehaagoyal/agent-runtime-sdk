import { describe, expect, it } from "vitest";
import { executeToolCall, ToolRegistry } from "../src/index.js";

describe("executeToolCall", () => {
  it("executes a registered tool with JSON arguments", async () => {
    const registry = new ToolRegistry([
      {
        definition: { name: "add", description: "Add two numbers." },
        execute: (args) => Number(args.a) + Number(args.b),
      },
    ]);

    await expect(
      executeToolCall({ id: "call_1", name: "add", arguments: '{"a":2,"b":3}' }, registry),
    ).resolves.toEqual({
      id: "call_1",
      name: "add",
      arguments: { a: 2, b: 3 },
      success: true,
      output: 5,
    });
  });

  it("returns a failed record for missing tools", async () => {
    await expect(
      executeToolCall({ id: "call_1", name: "missing", arguments: {} }, new ToolRegistry()),
    ).resolves.toMatchObject({ success: false, error: 'Tool "missing" is not registered.' });
  });

  it("returns a failed record for invalid JSON arguments", async () => {
    await expect(
      executeToolCall({ id: "call_1", name: "add", arguments: "{" }, new ToolRegistry()),
    ).resolves.toMatchObject({ success: false });
  });

  it("returns a failed record when the handler throws", async () => {
    const registry = new ToolRegistry([
      {
        definition: { name: "explode", description: "Throw an error." },
        execute: () => {
          throw new Error("boom");
        },
      },
    ]);

    await expect(
      executeToolCall({ id: "call_1", name: "explode", arguments: {} }, registry),
    ).resolves.toMatchObject({ success: false, error: 'Tool "explode" failed: boom' });
  });
});

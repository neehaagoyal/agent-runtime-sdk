import { ToolRegistry } from "./ToolRegistry.js";
import type { ToolCall, ToolExecutionRecord } from "../types/tool.js";

export async function executeToolCall(
  toolCall: ToolCall,
  registry: ToolRegistry,
  context?: Record<string, unknown>,
): Promise<ToolExecutionRecord> {
  const parsed = parseArguments(toolCall.arguments);

  if (!parsed.success) {
    return failedRecord(toolCall, {}, parsed.error);
  }

  const tool = registry.get(toolCall.name);
  if (!tool) {
    return failedRecord(toolCall, parsed.arguments, `Tool "${toolCall.name}" is not registered.`);
  }

  try {
    const output = await tool.execute(parsed.arguments, context);
    return {
      id: toolCall.id,
      name: toolCall.name,
      arguments: parsed.arguments,
      success: true,
      output,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tool execution error.";
    return failedRecord(toolCall, parsed.arguments, `Tool "${toolCall.name}" failed: ${message}`);
  }
}

function parseArguments(args: ToolCall["arguments"]):
  | { success: true; arguments: Record<string, unknown> }
  | { success: false; error: string } {
  if (args === undefined) {
    return { success: true, arguments: {} };
  }

  if (typeof args === "string") {
    try {
      const parsed = JSON.parse(args) as unknown;
      if (isRecord(parsed)) {
        return { success: true, arguments: parsed };
      }

      return { success: false, error: "Tool call arguments must decode to an object." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON.";
      return { success: false, error: `Tool call arguments are invalid JSON: ${message}` };
    }
  }

  if (isRecord(args)) {
    return { success: true, arguments: args };
  }

  return { success: false, error: "Tool call arguments must be an object or JSON object string." };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failedRecord(
  toolCall: ToolCall,
  args: Record<string, unknown>,
  error: string,
): ToolExecutionRecord {
  return {
    id: toolCall.id,
    name: toolCall.name,
    arguments: args,
    success: false,
    error,
  };
}

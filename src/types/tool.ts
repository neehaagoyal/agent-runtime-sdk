export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export type ToolHandler = (
  args: Record<string, unknown>,
  context?: Record<string, unknown>,
) => unknown | Promise<unknown>;

export interface Tool {
  definition: ToolDefinition;
  execute: ToolHandler;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments?: Record<string, unknown> | string;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export interface ToolExecutionRecord extends ToolExecutionResult {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

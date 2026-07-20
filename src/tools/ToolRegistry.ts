import { AgentRuntimeError } from "../types/errors.js";
import type { Tool, ToolDefinition } from "../types/tool.js";

export class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  constructor(tools: Tool[] = []) {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  register(tool: Tool): this {
    validateTool(tool);

    const name = tool.definition.name;
    if (this.tools.has(name)) {
      throw new AgentRuntimeError(`ToolRegistry already contains a tool named "${name}".`);
    }

    this.tools.set(name, tool);
    return this;
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values(), (tool) => ({ ...tool.definition }));
  }
}

function validateTool(tool: Tool): void {
  if (!tool || typeof tool !== "object") {
    throw new AgentRuntimeError("ToolRegistry requires a tool object.");
  }

  if (!tool.definition || typeof tool.definition !== "object") {
    throw new AgentRuntimeError("ToolRegistry tool.definition is required.");
  }

  const { name, description } = tool.definition;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new AgentRuntimeError("ToolRegistry tool.definition.name must be a non-empty string.");
  }

  if (typeof description !== "string" || description.trim().length === 0) {
    throw new AgentRuntimeError(
      "ToolRegistry tool.definition.description must be a non-empty string.",
    );
  }

  if (typeof tool.execute !== "function") {
    throw new AgentRuntimeError("ToolRegistry tool.execute must be a function.");
  }
}

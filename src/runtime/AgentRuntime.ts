import type { Provider } from "../providers/Provider.js";
import { TraceRecorder } from "../trace/TraceRecorder.js";
import { executeToolCall } from "../tools/executeToolCall.js";
import { ToolRegistry } from "../tools/ToolRegistry.js";
import { AgentRuntimeError } from "../types/errors.js";
import type { ProviderRequest } from "../types/provider.js";
import type { AgentRunInput, AgentRunResponse } from "../types/runtime.js";
import type { Tool } from "../types/tool.js";
import type { ExecutionTrace } from "../types/trace.js";

export interface AgentRuntimeOptions {
  provider: Provider;
  tools?: Tool[] | ToolRegistry;
}

export class AgentRuntime {
  private readonly provider: Provider;
  private readonly tools: ToolRegistry;

  constructor(options: AgentRuntimeOptions) {
    if (!options?.provider) {
      throw new AgentRuntimeError("AgentRuntime requires a provider.");
    }

    this.provider = options.provider;
    this.tools = normalizeTools(options.tools);
  }

  async run(input: AgentRunInput): Promise<AgentRunResponse> {
    const recorder = new TraceRecorder();
    const rawInput = typeof input?.input === "string" ? input.input : "";
    recorder.startRun({ input: rawInput });

    try {
      this.validateInput(input);

      const toolDefinitions = this.tools.list();
      const request: ProviderRequest = {
        input: input.input,
        instructions: input.instructions,
        context: input.context,
        ...(toolDefinitions.length > 0 ? { tools: toolDefinitions } : {}),
      };

      const providerStarted = recorder.recordProviderRequest(this.provider.name, request);
      const response = await this.provider.generate(request);
      recorder.recordProviderResponse(this.provider.name, response, providerStarted);

      const toolsUsed = [];
      for (const toolCall of response.toolCalls ?? []) {
        const toolStarted = recorder.recordToolCallStart(toolCall);
        const record = await executeToolCall(toolCall, this.tools, input.context);
        recorder.recordToolCallResult(record, toolStarted);
        toolsUsed.push(record);
      }

      const trace = recorder.endRun(true);
      return {
        text: response.text,
        metadata: {
          provider: response.metadata.provider,
          model: response.metadata.model,
          usage: response.metadata.usage,
          finishReason: response.metadata.finishReason,
          toolsUsed,
          trace,
        },
      };
    } catch (error) {
      recorder.recordError(error);
      const trace = recorder.endRun(false);
      attachTrace(error, trace);
      throw error;
    }
  }

  private validateInput(input: AgentRunInput): void {
    if (typeof input?.input !== "string" || input.input.trim().length === 0) {
      throw new AgentRuntimeError("AgentRuntime input.input must be a non-empty string.");
    }
  }
}

function normalizeTools(tools: AgentRuntimeOptions["tools"]): ToolRegistry {
  if (tools instanceof ToolRegistry) {
    return tools;
  }

  return new ToolRegistry(tools ?? []);
}

function attachTrace(error: unknown, trace: ExecutionTrace): void {
  if (typeof error === "object" && error !== null) {
    Object.defineProperty(error, "trace", {
      value: trace,
      enumerable: false,
      configurable: true,
    });
  }
}

import type { ToolExecutionRecord } from "./tool.js";
import type { ExecutionTrace } from "./trace.js";

export interface AgentRunInput {
  input: string;
  instructions?: string;
  context?: Record<string, unknown>;
}

export interface AgentRunMetadata {
  provider: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
  toolsUsed: ToolExecutionRecord[];
  trace: ExecutionTrace;
}

export interface AgentRunResponse {
  text: string;
  metadata: AgentRunMetadata;
}

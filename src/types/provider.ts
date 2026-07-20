import type { ToolCall, ToolDefinition } from "./tool.js";

export type ProviderMessageRole = "system" | "user" | "assistant";

export interface ProviderMessage {
  role: ProviderMessageRole;
  content: string;
}

export interface ProviderRequest {
  input: string;
  instructions?: string;
  context?: Record<string, unknown>;
  messages?: ProviderMessage[];
  tools?: ToolDefinition[];
}

export interface ProviderResponseMetadata {
  provider: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
}

export interface ProviderResponse {
  text: string;
  metadata: ProviderResponseMetadata;
  toolCalls?: ToolCall[];
}

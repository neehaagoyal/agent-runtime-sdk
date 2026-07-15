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
}

export interface AgentRunResponse {
  text: string;
  metadata: AgentRunMetadata;
}

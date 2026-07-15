export interface ProviderRequest {
  input: string;
  instructions?: string;
  context?: Record<string, unknown>;
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
}

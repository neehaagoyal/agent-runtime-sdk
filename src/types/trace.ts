export interface TraceError {
  name: string;
  message: string;
  code?: string;
}

export interface ExecutionTrace {
  runId: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  events: TraceEvent[];
}

export type TraceEvent =
  | RuntimeStartTraceEvent
  | ProviderRequestTraceEvent
  | ProviderResponseTraceEvent
  | ToolCallStartTraceEvent
  | ToolCallResultTraceEvent
  | RuntimeErrorTraceEvent
  | RuntimeEndTraceEvent;

export interface TraceEventBase {
  id: string;
  type: TraceEventType;
  timestamp: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export type TraceEventType =
  | "runtime.start"
  | "provider.request"
  | "provider.response"
  | "tool.call.start"
  | "tool.call.result"
  | "runtime.error"
  | "runtime.end";

export interface RuntimeStartTraceEvent extends TraceEventBase {
  type: "runtime.start";
  inputLength: number;
}

export interface ProviderRequestTraceEvent extends TraceEventBase {
  type: "provider.request";
  provider: string;
  hasTools: boolean;
}

export interface ProviderResponseTraceEvent extends TraceEventBase {
  type: "provider.response";
  provider: string;
  model?: string;
  finishReason?: string;
}

export interface ToolCallStartTraceEvent extends TraceEventBase {
  type: "tool.call.start";
  toolCallId: string;
  toolName: string;
}

export interface ToolCallResultTraceEvent extends TraceEventBase {
  type: "tool.call.result";
  toolCallId: string;
  toolName: string;
  success: boolean;
  error?: TraceError;
}

export interface RuntimeErrorTraceEvent extends TraceEventBase {
  type: "runtime.error";
  error: TraceError;
}

export interface RuntimeEndTraceEvent extends TraceEventBase {
  type: "runtime.end";
  success: boolean;
}

export { AgentRuntime } from "./runtime/AgentRuntime.js";
export type { AgentRuntimeOptions } from "./runtime/AgentRuntime.js";

export type {
  AgentRunInput,
  AgentRunMetadata,
  AgentRunResponse,
} from "./types/runtime.js";

export type {
  ProviderMessage,
  ProviderMessageRole,
  ProviderRequest,
  ProviderResponse,
  ProviderResponseMetadata,
} from "./types/provider.js";

export type {
  Tool,
  ToolCall,
  ToolDefinition,
  ToolExecutionRecord,
  ToolExecutionResult,
  ToolHandler,
} from "./types/tool.js";

export { AgentRuntimeError } from "./types/errors.js";
export { ToolRegistry } from "./tools/ToolRegistry.js";
export { executeToolCall } from "./tools/executeToolCall.js";

export type { Provider } from "./providers/Provider.js";
export { MockProvider } from "./providers/MockProvider.js";
export type { MockProviderOptions } from "./providers/MockProvider.js";

export {
  OpenAIProvider,
  mapProviderRequestToOpenAIMessages,
  mapToolDefinitionToOpenAITool,
} from "./providers/OpenAIProvider.js";
export type { OpenAIProviderOptions } from "./providers/OpenAIProvider.js";

export { TraceRecorder, normalizeTraceError } from "./trace/TraceRecorder.js";
export type { TraceRecorderOptions } from "./trace/TraceRecorder.js";
export { SystemTraceClock, durationMs } from "./trace/timing.js";
export type { ClockReading, TraceClock } from "./trace/timing.js";

export type {
  ExecutionTrace,
  ProviderRequestTraceEvent,
  ProviderResponseTraceEvent,
  RuntimeEndTraceEvent,
  RuntimeErrorTraceEvent,
  RuntimeStartTraceEvent,
  ToolCallResultTraceEvent,
  ToolCallStartTraceEvent,
  TraceError,
  TraceEvent,
  TraceEventBase,
  TraceEventType,
} from "./types/trace.js";

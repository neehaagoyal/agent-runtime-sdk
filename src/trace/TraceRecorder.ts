import type { ProviderRequest, ProviderResponse } from "../types/provider.js";
import type { ToolCall, ToolExecutionRecord } from "../types/tool.js";
import type { ExecutionTrace, TraceError, TraceEvent, TraceEventType } from "../types/trace.js";
import { durationMs, SystemTraceClock, type ClockReading, type TraceClock } from "./timing.js";

export interface TraceRecorderOptions {
  clock?: TraceClock;
  runId?: string;
}

export class TraceRecorder {
  private readonly clock: TraceClock;
  private readonly trace: ExecutionTrace;
  private eventSequence = 0;
  private readonly runStart: ClockReading;

  constructor(options: TraceRecorderOptions = {}) {
    this.clock = options.clock ?? new SystemTraceClock();
    this.runStart = this.clock.now();
    this.trace = {
      runId: options.runId ?? createId("run"),
      startedAt: this.runStart.timestamp,
      events: [],
    };
  }

  startRun(input: { input: string; metadata?: Record<string, unknown> }): void {
    this.push({ type: "runtime.start", inputLength: input.input.length, metadata: input.metadata });
  }

  recordProviderRequest(provider: string, request: ProviderRequest, metadata?: Record<string, unknown>): ClockReading {
    const started = this.clock.now();
    this.push({ type: "provider.request", provider, hasTools: (request.tools?.length ?? 0) > 0, metadata }, started);
    return started;
  }

  recordProviderResponse(provider: string, response: ProviderResponse, started: ClockReading): void {
    const ended = this.clock.now();
    this.push({
      type: "provider.response",
      provider,
      model: response.metadata.model,
      finishReason: response.metadata.finishReason,
      durationMs: durationMs(started, ended),
    }, ended);
  }

  recordToolCallStart(toolCall: ToolCall): ClockReading {
    const started = this.clock.now();
    this.push({ type: "tool.call.start", toolCallId: toolCall.id, toolName: toolCall.name }, started);
    return started;
  }

  recordToolCallResult(record: ToolExecutionRecord, started: ClockReading): void {
    const ended = this.clock.now();
    this.push({
      type: "tool.call.result",
      toolCallId: record.id,
      toolName: record.name,
      success: record.success,
      error: record.success ? undefined : normalizeTraceError(record.error ?? "Tool execution failed."),
      durationMs: durationMs(started, ended),
    }, ended);
  }

  recordError(error: unknown, metadata?: Record<string, unknown>): void {
    this.push({ type: "runtime.error", error: normalizeTraceError(error), metadata });
  }

  endRun(success: boolean): ExecutionTrace {
    const ended = this.clock.now();
    this.trace.endedAt = ended.timestamp;
    this.trace.durationMs = durationMs(this.runStart, ended);
    this.push({ type: "runtime.end", success, durationMs: this.trace.durationMs }, ended);
    return this.getTrace();
  }

  getTrace(): ExecutionTrace {
    return { ...this.trace, events: [...this.trace.events] };
  }

  private push(event: TraceEventDraft, reading = this.clock.now()): void {
    this.eventSequence += 1;
    this.trace.events.push({
      id: `${this.trace.runId}-event-${this.eventSequence}`,
      timestamp: reading.timestamp,
      ...event,
    } as TraceEvent);
  }
}

export function normalizeTraceError(error: unknown): TraceError {
  if (error instanceof Error) {
    const withCode = error as Error & { code?: unknown };
    return {
      name: error.name || "Error",
      message: error.message || "Unknown error.",
      ...(typeof withCode.code === "string" ? { code: withCode.code } : {}),
    };
  }

  if (typeof error === "string") {
    return { name: "Error", message: error };
  }

  return { name: "Error", message: "Unknown error." };
}

let nextRunId = 0;

function createId(prefix: string): string {
  nextRunId += 1;
  return `${prefix}-${nextRunId}`;
}

type TraceEventDraft = { type: TraceEventType; durationMs?: number; metadata?: Record<string, unknown> } & Record<string, unknown>;

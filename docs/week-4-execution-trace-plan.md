# Week 4 Execution Trace Plan

This plan breaks the PRD's Week 4 work into daily implementation tasks. Use it as the reference when asking the agent to perform each day's job.

## Week 4 Goal

Add execution tracing to Agent Runtime SDK v0.1 so every agent run can expose an ordered history of runtime events, LLM calls, tool calls, latency, and errors.

Week 4 deliverables:

- Trace model
- Execution history collection
- LLM call trace events
- Tool call trace events
- Latency measurement
- Error capture
- Tests for trace creation, ordering, timing, and error capture

By the end of Week 4, a developer should be able to run an agent request and inspect a structured trace showing what happened, in what order, how long each step took, and whether any step failed.

## Target Project Structure

```text
agent-runtime-sdk/
  src/
    index.ts
    runtime/
      AgentRuntime.ts
    trace/
      Trace.ts
      TraceRecorder.ts
      timing.ts
    types/
      runtime.ts
      provider.ts
      tool.ts
      trace.ts
      errors.ts
  tests/
    TraceRecorder.test.ts
    AgentRuntime.trace.test.ts
    traceTiming.test.ts
    traceErrors.test.ts
```

---

## Day 1: Define Trace Types and Event Model

### Objective

Create a structured trace model that can describe agent runs, provider calls, tool calls, timings, and errors in a provider-agnostic way.

### Implementation Tasks

- Add `src/types/trace.ts`.
- Define a root `ExecutionTrace` type with `runId`, `startedAt`, `endedAt`, `durationMs`, and ordered `events`.
- Define trace event types for:
  - runtime start
  - provider request
  - provider response
  - tool call start
  - tool call result
  - runtime error
  - runtime end
- Include stable event fields such as `id`, `type`, `timestamp`, `durationMs`, and optional `metadata`.
- Define a normalized trace error shape that avoids leaking raw unknown errors directly.
- Export intended public trace types from `src/index.ts`.

### Learning Goals

- Understand how execution traces differ from logs.
- Learn why trace events need stable ordering and timestamps.
- Learn how normalized error shapes make traces safe to inspect.

### Acceptance Criteria

- Trace types compile successfully.
- Trace events can represent LLM calls, tool calls, latency, and errors.
- Trace types are provider-agnostic.
- Existing tests continue to pass.

### Suggested Agent Prompt

```text
Please implement Day 1 from docs/week-4-execution-trace-plan.md. Add provider-agnostic trace types and export the intended public trace contracts without changing existing runtime behavior.
```

---

## Day 2: Implement TraceRecorder

### Objective

Create a small recorder that owns event ordering, timestamps, duration calculation, and final trace assembly.

### Implementation Tasks

- Add `src/trace/TraceRecorder.ts`.
- Add helper methods for starting and ending a run.
- Add helper methods for recording provider events and tool events.
- Generate stable event IDs and a run ID.
- Preserve insertion order for all events.
- Add duration calculations for completed operations.
- Add `tests/TraceRecorder.test.ts`.

### Learning Goals

- Understand why trace collection should be centralized.
- Learn how a recorder prevents ad hoc event shapes throughout runtime code.
- Learn how to test event ordering deterministically.

### Acceptance Criteria

- Recorder creates a trace with a run ID and ordered events.
- Recorder records start/end timestamps.
- Recorder calculates durations for completed operations.
- Recorder tests pass without relying on slow real timers.

### Suggested Agent Prompt

```text
Please implement Day 2 from docs/week-4-execution-trace-plan.md. Add TraceRecorder with ordered events, timing support, exports, and unit tests.
```

---

## Day 3: Add Timing Utilities

### Objective

Make latency measurement consistent and easy to test across provider calls, tool calls, and complete agent runs.

### Implementation Tasks

- Add `src/trace/timing.ts`.
- Provide a clock abstraction or small timing helper that can be mocked in tests.
- Use monotonic timing for durations when available.
- Convert durations to milliseconds.
- Add focused timing tests.
- Avoid spreading direct `Date.now()` calls throughout runtime code.

### Learning Goals

- Understand why wall-clock timestamps and durations are different concerns.
- Learn how mockable clocks make timing tests reliable.
- Learn why latency belongs in traces and observability data.

### Acceptance Criteria

- Timing utilities provide timestamps and duration measurement.
- Tests can use deterministic fake clocks.
- Duration values are numeric milliseconds.
- Existing trace recorder tests remain stable.

### Suggested Agent Prompt

```text
Please implement Day 3 from docs/week-4-execution-trace-plan.md. Add timing utilities with deterministic tests and integrate them into TraceRecorder where appropriate.
```

---

## Day 4: Integrate Trace Recording into AgentRuntime

### Objective

Record a trace for each agent run without changing the simple runtime usage pattern.

### Implementation Tasks

- Update `AgentRuntime.run()` to create a trace recorder at the start of each run.
- Record runtime start and runtime end events.
- Record provider request and provider response events.
- Attach the completed trace to the runtime response metadata or a dedicated response field.
- Keep existing response fields backward compatible.
- Add `tests/AgentRuntime.trace.test.ts`.

### Learning Goals

- Understand runtime-level observability.
- Learn how to add tracing without exposing provider internals.
- Learn how to verify ordered event sequences in tests.

### Acceptance Criteria

- Every successful runtime response includes an execution trace.
- Trace events are ordered from runtime start to runtime end.
- Provider request/response events are recorded.
- Existing no-trace consumer behavior remains compatible.
- Runtime trace tests pass.

### Suggested Agent Prompt

```text
Please implement Day 4 from docs/week-4-execution-trace-plan.md. Integrate TraceRecorder into AgentRuntime and add tests for successful run traces and event ordering.
```

---

## Day 5: Trace Tool Calls and Multi-Step Runs

### Objective

Extend tracing to cover Week 3 tool execution so traces show both LLM/provider activity and tool activity in one ordered execution history.

### Implementation Tasks

- Record tool call start events before executing each tool.
- Record tool call result events after each tool completes.
- Include tool name, call ID, duration, and success/failure state.
- Preserve ordering across provider and tool events.
- Add tests for a runtime run that includes at least one tool call.

### Learning Goals

- Understand traces for multi-step agent workflows.
- Learn how tool events help debug external action behavior.
- Learn why ordered traces matter when provider and tool calls interact.

### Acceptance Criteria

- Tool calls appear in the trace in the correct order.
- Tool durations are captured.
- Tool success and failure states are visible.
- End-to-end tool trace tests pass.

### Suggested Agent Prompt

```text
Please implement Day 5 from docs/week-4-execution-trace-plan.md. Add trace events for tool calls and verify ordered multi-step runtime traces with tests.
```

---

## Day 6: Capture Errors in Execution Traces

### Objective

Ensure failures during validation, provider calls, and tool execution are captured in the trace with useful normalized error information.

### Implementation Tasks

- Record validation errors when runtime input is invalid.
- Record provider errors when `generate()` fails.
- Record tool execution errors when handlers fail or tool calls are invalid.
- Normalize error details into a safe trace error shape.
- Decide whether failed runs throw, return failed responses, or do both consistently with earlier runtime behavior.
- Add `tests/traceErrors.test.ts`.

### Learning Goals

- Understand why observability is most valuable during failures.
- Learn how to normalize unknown errors safely.
- Learn how error traces support debugging without leaking secrets.

### Acceptance Criteria

- Failed provider calls produce trace error events before the error is surfaced.
- Failed tool executions are represented in the trace.
- Invalid input behavior remains clear and tested.
- Error trace tests pass.

### Suggested Agent Prompt

```text
Please implement Day 6 from docs/week-4-execution-trace-plan.md. Capture validation, provider, and tool errors in traces with normalized error details and focused tests.
```

---

## Day 7: Polish Trace Documentation and Public API

### Objective

Make execution traces easy to inspect and explain for SDK users.

### Implementation Tasks

- Update `src/index.ts` with intended trace exports.
- Update `README.md` with an execution trace example.
- Document what events can appear in a trace.
- Document how errors and durations are represented.
- Run tests, typecheck, and build.
- Confirm README examples match the actual API.

### Example Trace Usage

```ts
import { AgentRuntime, MockProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new MockProvider(),
});

const response = await runtime.run({
  input: "Summarize this request",
});

console.log(response.metadata.trace.events);
```

### Learning Goals

- Learn how trace documentation improves SDK debuggability.
- Learn how to present observability data without overwhelming users.
- Learn how public trace types support downstream integrations.

### Acceptance Criteria

- README includes a working trace inspection example.
- Public exports include intended trace types.
- All Week 4 tests pass.
- Build and typecheck pass.

### Suggested Agent Prompt

```text
Please implement Day 7 from docs/week-4-execution-trace-plan.md. Polish trace exports and documentation, verify examples, and run the full build/test suite.
```

---

## End-of-Week Definition of Done

Week 4 is complete when this example works:

```ts
import { AgentRuntime, MockProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new MockProvider(),
});

const result = await runtime.run({
  input: "Hello",
});

console.log(result.metadata.trace);
```

Expected behavior:

- Every run creates an ordered execution trace.
- The trace includes provider events for LLM calls.
- The trace includes tool events when tools are used.
- The trace includes latency information.
- Errors are captured in a normalized form.
- Tests cover trace creation, ordering, timing, and error capture.

## Daily Workflow Recommendation

For each day:

1. Read that day's section in this plan.
2. Ask the agent to implement only that day's work.
3. Review the changed files.
4. Run build and tests.
5. Write a short note about what changed and what you learned.

Suggested note format:

```md
## Day N Notes

### What I built

### What I learned

### Why this matters for the SDK

### What is still missing
```

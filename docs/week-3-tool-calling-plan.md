# Week 3 Tool Calling Plan

This plan breaks the PRD's Week 3 work into daily implementation tasks. Use it as the reference when asking the agent to perform each day's job.

## Week 3 Goal

Add tool calling support to Agent Runtime SDK v0.1 so an agent can register typed tools, detect provider-requested tool calls, execute those tools safely, and return a final response that reports which tools were used.

Week 3 deliverables:

- Tool registry
- Tool definition and execution types
- Runtime tool execution pipeline
- Tool-aware provider request/response types
- Final response plus tools used
- Tests for registration, execution, error handling, and an end-to-end tool scenario

By the end of Week 3, a developer should be able to register a tool, run an agent request that requires an external action, and receive a normalized response with a list of tool calls that were executed.

## Target Project Structure

```text
agent-runtime-sdk/
  src/
    index.ts
    runtime/
      AgentRuntime.ts
    providers/
      Provider.ts
      MockProvider.ts
      OpenAIProvider.ts
    tools/
      Tool.ts
      ToolRegistry.ts
      executeToolCall.ts
    types/
      runtime.ts
      provider.ts
      tool.ts
      errors.ts
  tests/
    ToolRegistry.test.ts
    executeToolCall.test.ts
    AgentRuntime.tools.test.ts
    MockProvider.test.ts
```

---

## Day 1: Define Tool Types and Public Contracts

### Objective

Create provider-agnostic tool contracts that describe tool definitions, arguments, execution results, and tool-call metadata without depending on any specific LLM vendor.

### Implementation Tasks

- Add `src/types/tool.ts`.
- Define `ToolDefinition` with `name`, `description`, and optional JSON-schema-like `parameters`.
- Define `ToolHandler` as an async or sync function that receives parsed arguments and optional execution context.
- Define `Tool` as a definition plus handler.
- Define `ToolCall`, `ToolExecutionResult`, and `ToolExecutionRecord` types.
- Extend runtime response metadata or response shape to include `toolsUsed` or equivalent tool execution records.
- Export intended public tool types from `src/index.ts`.

### Example Tool Types

```ts
export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export type ToolHandler = (
  args: Record<string, unknown>,
  context?: Record<string, unknown>,
) => unknown | Promise<unknown>;

export interface Tool {
  definition: ToolDefinition;
  execute: ToolHandler;
}
```

### Learning Goals

- Understand how SDKs represent tool capabilities in a provider-neutral way.
- Learn why tool definitions and tool handlers should be separate concepts.
- Learn how response metadata can explain what happened during an agent run.

### Acceptance Criteria

- Tool types compile successfully.
- Tool contracts do not expose OpenAI-specific type names.
- Public exports include only the intended tool API.
- Existing Week 1 and Week 2 tests continue to pass.

### Suggested Agent Prompt

```text
Please implement Day 1 from docs/week-3-tool-calling-plan.md. Add provider-agnostic tool types and export the intended public contracts while preserving existing tests.
```

---

## Day 2: Implement ToolRegistry

### Objective

Create a registry that lets developers register, retrieve, list, and validate tools before runtime execution.

### Implementation Tasks

- Add `src/tools/ToolRegistry.ts`.
- Support registering a single tool.
- Support registering multiple tools at construction time.
- Reject duplicate tool names with a clear error.
- Validate tool names, descriptions, and handlers.
- Add methods such as `register(tool)`, `get(name)`, `list()`, and `has(name)`.
- Add `tests/ToolRegistry.test.ts`.

### Learning Goals

- Understand why registries centralize lookup and validation.
- Learn how duplicate-name protection prevents ambiguous tool execution.
- Learn how deterministic registry behavior simplifies runtime orchestration.

### Acceptance Criteria

- Tools can be registered and retrieved by name.
- Duplicate tool names throw clear errors.
- Invalid tools throw clear errors.
- Listing tools returns stable provider-ready definitions without exposing handlers.
- Tool registry tests pass.

### Suggested Agent Prompt

```text
Please implement Day 2 from docs/week-3-tool-calling-plan.md. Add ToolRegistry with validation, lookup, listing, exports, and focused unit tests.
```

---

## Day 3: Extend Provider Contracts for Tool Calls

### Objective

Update provider request and response types so providers can receive available tool definitions and return requested tool calls.

### Implementation Tasks

- Update `src/types/provider.ts` to include optional available tools on `ProviderRequest`.
- Add provider-neutral tool-call response types with `id`, `name`, and serialized or parsed arguments.
- Update `MockProvider` so tests can simulate a tool call deterministically.
- Ensure `OpenAIProvider` can map SDK tool definitions to provider-specific tool definitions when Week 2 is complete.
- Preserve backward compatibility for providers that do not use tools.

### Learning Goals

- Understand how tool definitions flow from runtime to provider.
- Learn why provider responses need to represent requested tool calls separately from final text.
- Learn how a mock provider can simulate multi-step agent behavior.

### Acceptance Criteria

- Provider types support optional tool definitions and optional tool calls.
- Existing no-tool provider behavior remains unchanged.
- Mock provider can return either plain text or a configured tool call.
- Typecheck and existing tests pass.

### Suggested Agent Prompt

```text
Please implement Day 3 from docs/week-3-tool-calling-plan.md. Extend provider contracts for tool definitions/tool calls and update MockProvider to support deterministic tool-call simulation.
```

---

## Day 4: Build Tool Execution Helper and Error Handling

### Objective

Implement the execution unit that takes a requested tool call, looks up the tool, runs it, and returns a normalized execution record.

### Implementation Tasks

- Add `src/tools/executeToolCall.ts`.
- Parse tool call arguments safely when they are serialized JSON.
- Look up the requested tool in `ToolRegistry`.
- Execute the handler with parsed arguments and runtime context.
- Normalize successful results into `ToolExecutionRecord`.
- Normalize missing-tool, invalid-arguments, and handler-thrown errors into clear SDK errors or failed records.
- Add `tests/executeToolCall.test.ts`.

### Learning Goals

- Understand the boundary between model-requested actions and trusted application code.
- Learn why tool argument parsing needs explicit error handling.
- Learn how failed tool executions should still be observable.

### Acceptance Criteria

- Valid tool calls execute and return normalized records.
- Missing tools are handled predictably.
- Invalid JSON arguments are handled predictably.
- Handler errors are captured or surfaced consistently.
- Execution helper tests pass.

### Suggested Agent Prompt

```text
Please implement Day 4 from docs/week-3-tool-calling-plan.md. Add executeToolCall with argument parsing, registry lookup, success/error normalization, and unit tests.
```

---

## Day 5: Integrate Tools into AgentRuntime

### Objective

Teach `AgentRuntime` to pass registered tools to the provider, execute requested tool calls, and include tool usage in the final runtime response.

### Implementation Tasks

- Extend `AgentRuntimeOptions` to accept tools or a `ToolRegistry`.
- Pass available tool definitions to the provider during `run()`.
- Detect tool calls in provider responses.
- Execute tool calls through the helper from Day 4.
- Include executed tool records in the final response metadata or response body.
- Keep no-tool runtime behavior backward compatible.
- Add `tests/AgentRuntime.tools.test.ts`.

### Learning Goals

- Understand runtime orchestration across LLM calls and external actions.
- Learn how tool execution changes response metadata without breaking simple requests.
- Learn how to test multi-step runtime behavior with fake providers.

### Acceptance Criteria

- Runtime passes registered tool definitions to the provider.
- Runtime executes requested tools and records tool usage.
- Runtime still works when no tools are registered.
- Tool execution errors are visible in the response or surfaced with clear errors.
- Runtime tool tests pass.

### Suggested Agent Prompt

```text
Please implement Day 5 from docs/week-3-tool-calling-plan.md. Integrate ToolRegistry and tool execution into AgentRuntime with backward-compatible response behavior and tests.
```

---

## Day 6: Add End-to-End Tool Scenario

### Objective

Prove the full Week 3 workflow with a realistic user request requiring an external action.

### Implementation Tasks

- Add an end-to-end test using a deterministic mock provider.
- Create a sample tool such as `getOrderStatus`, `lookupDocument`, or `calculateTotal`.
- Simulate a provider response that requests the sample tool.
- Execute the tool through the runtime.
- Return a final response plus the list of tools used.
- Assert stable tool execution details rather than model-specific prose.

### Learning Goals

- Understand how tool calling enables useful agent workflows.
- Learn how to test end-to-end orchestration without a real LLM.
- Learn why final responses should include auditable tool-use information.

### Acceptance Criteria

- End-to-end test covers registration, provider tool call, execution, and final response.
- Test does not require network access or API keys.
- Tool usage is visible in the final response.
- Full unit test suite passes.

### Suggested Agent Prompt

```text
Please implement Day 6 from docs/week-3-tool-calling-plan.md. Add a deterministic end-to-end tool-calling test that returns a final response plus tools used.
```

---

## Day 7: Polish Tool Calling Documentation and Exports

### Objective

Make the Week 3 tool API easy for SDK users to import, understand, and apply.

### Implementation Tasks

- Update `src/index.ts` with intended tool exports.
- Update `README.md` with a tool registration and execution example.
- Document tool error behavior.
- Document how `MockProvider` can simulate tool calls in tests.
- Run tests, typecheck, and build.
- Confirm examples match the actual API.

### Example Tool Usage

```ts
import { AgentRuntime, MockProvider, ToolRegistry } from "agent-runtime-sdk";

const tools = new ToolRegistry([
  {
    definition: {
      name: "getOrderStatus",
      description: "Look up the status of an order by order ID.",
    },
    execute: async (args) => ({ orderId: args.orderId, status: "shipped" }),
  },
]);

const runtime = new AgentRuntime({
  provider: new MockProvider(),
  tools,
});

const response = await runtime.run({
  input: "Where is order 123?",
});

console.log(response.text);
console.log(response.metadata.toolsUsed);
```

### Learning Goals

- Learn how documentation validates API ergonomics.
- Learn how to expose a focused public tool API.
- Learn how examples help prevent accidental breaking changes.

### Acceptance Criteria

- README includes a working tool-calling example.
- Public exports include intended tool classes and types.
- All Week 3 tests pass.
- Build and typecheck pass.

### Suggested Agent Prompt

```text
Please implement Day 7 from docs/week-3-tool-calling-plan.md. Polish tool exports and documentation, verify examples, and run the full build/test suite.
```

---

## End-of-Week Definition of Done

Week 3 is complete when this example works:

```ts
import { AgentRuntime, MockProvider, ToolRegistry } from "agent-runtime-sdk";

const tools = new ToolRegistry([
  {
    definition: {
      name: "getOrderStatus",
      description: "Look up order status.",
    },
    execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
  },
]);

const runtime = new AgentRuntime({
  provider: new MockProvider(),
  tools,
});

const result = await runtime.run({
  input: "Check order 123",
});

console.log(result.text);
console.log(result.metadata.toolsUsed);
```

Expected behavior:

- Tools can be registered and listed.
- The runtime passes tool definitions to the provider.
- The provider can request a tool call.
- The runtime executes requested tools safely.
- The final response includes text plus tools used.
- Tests cover registration, execution, error handling, and an end-to-end tool scenario.

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

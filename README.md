# Agent Runtime SDK

Agent Runtime SDK is a TypeScript SDK foundation for running agent requests through a provider-agnostic runtime API. It gives application code one small runtime surface while providers implement a stable `Provider` contract behind it.

## Week 3 Capabilities

Version `0.1.0` includes the Week 3 tool-calling foundation:

- `AgentRuntime` for validating and running agent requests.
- A vendor-neutral `Provider` interface for model/provider adapters.
- `MockProvider` for deterministic local development and tests with no network access or API keys.
- `OpenAIProvider` for sending provider-neutral requests to OpenAI chat completions.
- Provider request support for prompt-style `input` plus `instructions`, or explicit ordered `messages`.
- Normalized runtime responses with `text`, provider metadata, usage token metadata, and finish reasons.
- A typed `ToolRegistry` for registering provider-neutral tool definitions and handlers.
- Runtime execution of provider-requested tool calls with auditable `metadata.toolsUsed` records.
- Unit and contract tests that run without external services, plus an optional live OpenAI integration test.

## Installation and Local Setup

Install dependencies:

```sh
npm install
```

Build the SDK:

```sh
npm run build
```

Run the test suite:

```sh
npm test
```

Run type checking:

```sh
npm run typecheck
```

## Mock Provider Usage

Import from the package entry point rather than internal source paths:

```ts
import { AgentRuntime, MockProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new MockProvider(),
});

const response = await runtime.run({
  input: "Write a welcome message",
  instructions: "Be concise",
  context: {
    userId: "user_123",
  },
});

console.log(response.text);
console.log(response.metadata);
```

The default `MockProvider` returns deterministic text and metadata. You can customize it for tests:

```ts
import { MockProvider } from "agent-runtime-sdk";

const provider = new MockProvider({
  responseText: "Custom test response",
  model: "mock-custom-model",
});
```


## Tool Calling Usage

Register tools with provider-neutral definitions and handlers, then pass the registry to `AgentRuntime`:

```ts
import { AgentRuntime, MockProvider, ToolRegistry } from "agent-runtime-sdk";

const tools = new ToolRegistry([
  {
    definition: {
      name: "getOrderStatus",
      description: "Look up the status of an order by order ID.",
      parameters: {
        type: "object",
        properties: { orderId: { type: "string" } },
        required: ["orderId"],
      },
    },
    execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
  },
]);

const runtime = new AgentRuntime({
  provider: new MockProvider({
    responseText: "Order lookup complete.",
    toolCalls: [
      { id: "call_1", name: "getOrderStatus", arguments: { orderId: "123" } },
    ],
  }),
  tools,
});

const response = await runtime.run({
  input: "Where is order 123?",
});

console.log(response.text);
console.log(response.metadata.toolsUsed);
```

`ToolRegistry` rejects invalid or duplicate tools before runtime execution. During a run, `executeToolCall` parses JSON argument strings, looks up the requested tool, executes the handler with the runtime context, and records either a successful output or a failed record with a clear error message. Tool execution failures are observable in `response.metadata.toolsUsed` instead of being hidden.

`MockProvider` can simulate tool calls by passing `toolCalls` in its constructor, which keeps tool-calling tests deterministic and free of network access or API keys.

## OpenAI Provider Usage

Set an API key before constructing `OpenAIProvider`:

```sh
export OPENAI_API_KEY="sk-..."
```

Then swap providers without changing runtime calls:

```ts
import { AgentRuntime, OpenAIProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4.1-mini",
  }),
});

const response = await runtime.run({
  input: "Write a short welcome message",
  instructions: "Be concise and friendly",
});

console.log(response.text);
console.log(response.metadata.usage);
console.log(response.metadata.finishReason);
```

`OpenAIProvider` maps `instructions` to a system message and `input` to a user message. If `messages` are supplied directly at the provider layer, those ordered provider-neutral messages are preserved.

## Optional Live OpenAI Integration Test

Normal unit tests never require network access or secrets. The live integration test in `tests/openai.integration.test.ts` is skipped unless `OPENAI_API_KEY` is set:

```sh
OPENAI_API_KEY="sk-..." npm test -- tests/openai.integration.test.ts
```

You may optionally set `OPENAI_MODEL`; otherwise the provider default is used.

## Public API

```ts
export { AgentRuntime } from "agent-runtime-sdk";
export { MockProvider } from "agent-runtime-sdk";
export { OpenAIProvider } from "agent-runtime-sdk";
export { ToolRegistry } from "agent-runtime-sdk";
export { executeToolCall } from "agent-runtime-sdk";
export { mapProviderRequestToOpenAIMessages } from "agent-runtime-sdk";
export { AgentRuntimeError } from "agent-runtime-sdk";

export type {
  AgentRuntimeOptions,
  AgentRunInput,
  AgentRunMetadata,
  AgentRunResponse,
  MockProviderOptions,
  OpenAIProviderOptions,
  Provider,
  ProviderMessage,
  ProviderMessageRole,
  ProviderRequest,
  ProviderResponse,
  ProviderResponseMetadata,
  Tool,
  ToolCall,
  ToolDefinition,
  ToolExecutionRecord,
  ToolExecutionResult,
  ToolHandler,
} from "agent-runtime-sdk";
```

## Project Layout

```text
src/
  index.ts
  runtime/
    AgentRuntime.ts
  providers/
    Provider.ts
    MockProvider.ts
    OpenAIProvider.ts
  tools/
    ToolRegistry.ts
    executeToolCall.ts
  types/
    errors.ts
    provider.ts
    runtime.ts
    tool.ts
tests/
  AgentRuntime.test.ts
  MockProvider.test.ts
  OpenAIProvider.test.ts
  ToolRegistry.test.ts
  executeToolCall.test.ts
  AgentRuntime.tools.test.ts
  providerContract.test.ts
  openai.integration.test.ts
  types.test.ts
```

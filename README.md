# Agent Runtime SDK

Agent Runtime SDK is a TypeScript SDK foundation for running agent requests through a provider-agnostic runtime API. It gives application code one small runtime surface while providers implement a stable `Provider` contract behind it.

## Week 1 Capabilities

Version `0.1.0` includes the Week 1 runtime foundation:

- `AgentRuntime` for validating and running agent requests.
- A vendor-neutral `Provider` interface for model/provider adapters.
- `MockProvider` for deterministic local development and tests with no network access or API keys.
- Normalized runtime responses with `text` and provider metadata.
- Shared public TypeScript types for runtime inputs, runtime responses, provider requests, provider responses, and SDK errors.
- Tests covering initialization, request forwarding, response normalization, invalid input handling, and mock provider behavior.

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

## Usage

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

The default `MockProvider` returns deterministic text and metadata:

```ts
{
  text: "Mock provider response",
  metadata: {
    provider: "mock",
    model: "mock-model",
    usage: {
      inputTokens: 4,
      outputTokens: 3,
      totalTokens: 7,
    },
    finishReason: "stop",
  },
}
```

You can customize the mock response for tests:

```ts
import { MockProvider } from "agent-runtime-sdk";

const provider = new MockProvider({
  responseText: "Custom test response",
  model: "mock-custom-model",
});
```

## Public API

```ts
export { AgentRuntime } from "agent-runtime-sdk";
export { MockProvider } from "agent-runtime-sdk";
export { AgentRuntimeError } from "agent-runtime-sdk";

export type {
  AgentRuntimeOptions,
  AgentRunInput,
  AgentRunMetadata,
  AgentRunResponse,
  MockProviderOptions,
  Provider,
  ProviderRequest,
  ProviderResponse,
  ProviderResponseMetadata,
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
  types/
    errors.ts
    provider.ts
    runtime.ts
tests/
  AgentRuntime.test.ts
  MockProvider.test.ts
  types.test.ts
```

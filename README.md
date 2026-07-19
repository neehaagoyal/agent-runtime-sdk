# Agent Runtime SDK

Agent Runtime SDK is a TypeScript SDK foundation for running agent requests through a provider-agnostic runtime API. It gives application code one small runtime surface while providers implement a stable `Provider` contract behind it.

## Week 2 Capabilities

Version `0.1.0` includes the Week 2 provider integration foundation:

- `AgentRuntime` for validating and running agent requests.
- A vendor-neutral `Provider` interface for model/provider adapters.
- `MockProvider` for deterministic local development and tests with no network access or API keys.
- `OpenAIProvider` for sending provider-neutral requests to OpenAI chat completions.
- Provider request support for prompt-style `input` plus `instructions`, or explicit ordered `messages`.
- Normalized runtime responses with `text`, provider metadata, usage token metadata, and finish reasons.
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
  types/
    errors.ts
    provider.ts
    runtime.ts
tests/
  AgentRuntime.test.ts
  MockProvider.test.ts
  OpenAIProvider.test.ts
  providerContract.test.ts
  openai.integration.test.ts
  types.test.ts
```

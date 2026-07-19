# Week 2 Provider Integration Plan

This plan breaks the PRD's Week 2 work into daily implementation tasks. Use it as the reference when asking the agent to perform each day's job.

## Week 2 Goal

Implement the first real LLM provider integration for Agent Runtime SDK v0.1 while preserving the provider-agnostic runtime contract from Week 1:

- `OpenAIProvider`
- Continued `MockProvider` support
- Prompt/message input support at the provider layer
- Provider-agnostic response normalization
- Usage and finish reason metadata
- Provider contract tests, normalization tests, and optional live integration tests gated by an API key

By the end of Week 2, a developer should be able to keep using `AgentRuntime`, swap `MockProvider` for `OpenAIProvider`, send a prompt or messages through the provider contract, and receive the same normalized SDK response shape.

## Target Project Structure

```text
agent-runtime-sdk/
  package.json
  tsconfig.json
  vitest.config.ts
  README.md
  src/
    index.ts
    runtime/
      AgentRuntime.ts
    providers/
      Provider.ts
      MockProvider.ts
      OpenAIProvider.ts
    types/
      runtime.ts
      provider.ts
      errors.ts
  tests/
    AgentRuntime.test.ts
    MockProvider.test.ts
    OpenAIProvider.test.ts
    providerContract.test.ts
    openai.integration.test.ts
```

---

## Day 1: Review Week 1 Contracts and Design Week 2 Provider Types

### Objective

Extend the provider contract carefully so OpenAI-style prompts and chat messages can be represented without making the runtime vendor-specific.

### Implementation Tasks

- Review the current Week 1 provider and runtime types.
- Update `src/types/provider.ts` to support provider input as either:
  - a simple prompt derived from `input`, or
  - an ordered list of messages.
- Add a provider-agnostic message type with `role` and `content`.
- Keep runtime-level `AgentRunInput` stable unless a change is required for compatibility.
- Preserve existing `MockProvider` and `AgentRuntime` behavior.
- Export any new public provider types from `src/index.ts` when they are intended for SDK users.

### Example Provider Types

```ts
export type ProviderMessageRole = "system" | "user" | "assistant";

export interface ProviderMessage {
  role: ProviderMessageRole;
  content: string;
}

export interface ProviderRequest {
  input: string;
  instructions?: string;
  context?: Record<string, unknown>;
  messages?: ProviderMessage[];
}
```

### Learning Goals

- Understand how provider contracts evolve without breaking runtime users.
- Learn why provider-neutral message types are preferable to vendor-specific SDK types.
- Learn how to keep a stable public API while adding capability.

### Acceptance Criteria

- TypeScript compiles successfully.
- Existing Week 1 tests still pass.
- Provider request types can represent prompt-style and message-style input.
- No OpenAI SDK types leak into runtime-level public contracts.

### Suggested Agent Prompt

```text
Please implement Day 1 from docs/week-2-provider-integration-plan.md. Extend the provider request types for prompt/messages while preserving Week 1 runtime behavior and tests.
```

---

## Day 2: Add OpenAIProvider Configuration and Request Mapping

### Objective

Create the `OpenAIProvider` shell with configuration, validation, and provider-neutral request mapping before making real API calls.

### Implementation Tasks

- Add `src/providers/OpenAIProvider.ts`.
- Define `OpenAIProviderOptions` with:
  - `apiKey`
  - optional `model`
  - optional base URL or client configuration only if needed.
- Validate that an API key is provided.
- Implement request mapping from provider-neutral input into OpenAI-compatible messages:
  - `instructions` becomes a system message.
  - `input` becomes a user message.
  - `messages` are preserved when explicitly supplied.
- Keep request mapping in small helper functions to make it easy to test.
- Export `OpenAIProvider` and related option types from `src/index.ts`.

### Learning Goals

- Understand how provider adapters translate SDK contracts into vendor API calls.
- Learn why configuration validation should fail early.
- Learn how to isolate request mapping from network behavior.

### Acceptance Criteria

- `OpenAIProvider` can be constructed with an API key.
- Missing API key throws a clear SDK error.
- Request mapping can be tested without network access.
- Existing Week 1 tests still pass.

### Suggested Agent Prompt

```text
Please implement Day 2 from docs/week-2-provider-integration-plan.md. Add OpenAIProvider configuration and request mapping, export it publicly, and cover validation/mapping with tests.
```

---

## Day 3: Implement OpenAI API Call and Response Normalization

### Objective

Connect `OpenAIProvider.generate()` to the OpenAI API and normalize provider responses into the SDK's provider-agnostic response shape.

### Implementation Tasks

- Add the required OpenAI client dependency if the project will use the official SDK.
- Implement `OpenAIProvider.generate(request)`.
- Send the mapped prompt/messages and configured model to OpenAI.
- Normalize the OpenAI response into `ProviderResponse` with:
  - `text`
  - `metadata.provider`
  - `metadata.model`
  - `metadata.usage.inputTokens`
  - `metadata.usage.outputTokens`
  - `metadata.usage.totalTokens`
  - `metadata.finishReason`
- Convert provider/API errors into clear SDK errors where appropriate.
- Avoid requiring a real API key for normal unit tests.

### Learning Goals

- Understand response normalization across provider-specific APIs.
- Learn how usage metadata maps into SDK-level metadata.
- Learn how to keep network-dependent behavior separate from unit tests.

### Acceptance Criteria

- `OpenAIProvider.generate()` returns the same `ProviderResponse` shape as `MockProvider`.
- Usage metadata is mapped when available.
- Finish reason is mapped when available.
- Unit tests do not make real network calls.
- Typecheck and existing tests pass.

### Suggested Agent Prompt

```text
Please implement Day 3 from docs/week-2-provider-integration-plan.md. Wire OpenAIProvider.generate to the OpenAI client, normalize response metadata, and mock the API in unit tests.
```

---

## Day 4: Add Provider Contract Tests Shared by MockProvider and OpenAIProvider

### Objective

Create reusable provider contract tests that prove every provider follows the same SDK-level behavior.

### Implementation Tasks

- Add `tests/providerContract.test.ts` or a reusable contract helper.
- Test that each provider has a stable `name`.
- Test that each provider returns `text` as a string.
- Test that each provider includes provider metadata.
- Test that usage metadata, when present, follows the normalized token fields.
- Test that finish reason, when present, is exposed as a provider-agnostic string.
- Run the same contract assertions against `MockProvider` and a mocked `OpenAIProvider`.

### Learning Goals

- Understand provider contract testing.
- Learn how shared tests prevent provider drift.
- Learn how contract tests make future provider additions safer.

### Acceptance Criteria

- Contract tests pass for `MockProvider`.
- Contract tests pass for `OpenAIProvider` without a live API call.
- Providers remain interchangeable from the runtime's perspective.
- No contract test depends on external services or secrets.

### Suggested Agent Prompt

```text
Please implement Day 4 from docs/week-2-provider-integration-plan.md. Add reusable provider contract tests for MockProvider and OpenAIProvider using mocked OpenAI responses.
```

---

## Day 5: Strengthen AgentRuntime Normalization Tests with OpenAIProvider

### Objective

Prove that `AgentRuntime` can use the OpenAI provider through the same provider interface and return normalized runtime responses.

### Implementation Tasks

- Add or update `tests/AgentRuntime.test.ts`.
- Instantiate `AgentRuntime` with a mocked `OpenAIProvider` or a fake provider that mimics OpenAI metadata.
- Verify that runtime output remains `AgentRunResponse`.
- Verify that OpenAI-style usage data maps through runtime metadata.
- Verify that finish reason maps through runtime metadata.
- Verify that request forwarding still includes `input`, `instructions`, and `context`.

### Learning Goals

- Understand why runtime tests should focus on orchestration and normalization.
- Learn how provider-specific metadata becomes provider-agnostic runtime metadata.
- Learn how to test provider swapping without live credentials.

### Acceptance Criteria

- Runtime works with `MockProvider` and OpenAI-style provider responses.
- Runtime response shape does not change for SDK users.
- Normalization tests cover usage and finish reason metadata.
- Full unit test suite passes without network access.

### Suggested Agent Prompt

```text
Please implement Day 5 from docs/week-2-provider-integration-plan.md. Strengthen AgentRuntime normalization tests with OpenAI-style provider responses and ensure provider swapping remains transparent.
```

---

## Day 6: Add Optional Live OpenAI Integration Test

### Objective

Add a live integration test that can verify the real OpenAI API path when credentials are available, while remaining skipped in local and CI environments without an API key.

### Implementation Tasks

- Add `tests/openai.integration.test.ts`.
- Gate the test behind `OPENAI_API_KEY`.
- Skip the test when `OPENAI_API_KEY` is not set.
- Use a small deterministic prompt.
- Assert only stable response properties:
  - response text is a string
  - provider metadata is `openai`
  - model metadata exists when returned
  - usage metadata is numeric when returned
  - finish reason exists when returned
- Document how to run the integration test locally.

### Learning Goals

- Understand the difference between unit and live integration tests.
- Learn how to avoid making CI depend on external credentials by default.
- Learn why live tests should assert stable contracts, not exact model text.

### Acceptance Criteria

- Test suite passes without `OPENAI_API_KEY` by skipping the live test.
- Live integration test runs when `OPENAI_API_KEY` is provided.
- No API key is committed to the repository.
- README or docs explain how to run the live test.

### Suggested Agent Prompt

```text
Please implement Day 6 from docs/week-2-provider-integration-plan.md. Add an optional live OpenAI integration test gated by OPENAI_API_KEY and document how to run it safely.
```

---

## Day 7: Polish Exports, Documentation, and Week 2 Definition of Done

### Objective

Make the Week 2 provider integration easy to import, configure, test, and understand.

### Implementation Tasks

- Update `src/index.ts` to export the intended Week 2 public API only.
- Update `README.md` with:
  - `OpenAIProvider` setup
  - required environment variables
  - mock provider usage
  - provider swapping example
  - test commands, including optional live integration tests
- Confirm README examples match the actual exported API.
- Run the full test, typecheck, and build suite.
- Confirm no secrets or generated artifacts are committed.

### Example Provider Swapping Usage

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

### Learning Goals

- Learn how documentation validates SDK usability.
- Learn how to present mock and real provider paths clearly.
- Learn why public exports should stay small and intentional.

### Acceptance Criteria

- README includes a working `OpenAIProvider` example.
- README explains `OPENAI_API_KEY` and optional live test behavior.
- Public exports include `OpenAIProvider` and intended provider types.
- All unit tests pass.
- Build and typecheck pass.

### Suggested Agent Prompt

```text
Please implement Day 7 from docs/week-2-provider-integration-plan.md. Polish Week 2 exports and documentation, verify examples, and run the full build/test suite.
```

---

## End-of-Week Definition of Done

Week 2 is complete when this example works with a real API key:

```ts
import { AgentRuntime, OpenAIProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

const result = await runtime.run({
  input: "Hello",
  instructions: "Reply warmly",
  context: {
    userId: "user_123",
  },
});

console.log(result.text);
console.log(result.metadata);
```

Expected behavior:

- The runtime validates the request.
- The request is forwarded through the provider interface.
- `OpenAIProvider` maps the request to OpenAI-compatible prompt/messages.
- The provider returns a response from OpenAI when an API key is configured.
- The provider normalizes text, usage, model, and finish reason metadata.
- `MockProvider` still works for tests and local development.
- Unit tests run without external services.
- Optional live integration tests run only when `OPENAI_API_KEY` is provided.

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

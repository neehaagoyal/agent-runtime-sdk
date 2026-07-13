# Week 1 Runtime Foundation Plan

This plan breaks the PRD's Week 1 work into daily implementation tasks. Use it as the reference when asking the agent to perform each day's job.

## Week 1 Goal

Implement the runtime foundation for Agent Runtime SDK v0.1:

- `AgentRuntime`
- Provider interface
- `MockProvider`
- Shared runtime and provider types
- Foundational tests for initialization, request forwarding, response normalization, and invalid input handling

By the end of Week 1, a developer should be able to create a runtime, plug in a mock provider, run a request, and receive a normalized response with metadata.

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
    types/
      runtime.ts
      provider.ts
      errors.ts
  tests/
    AgentRuntime.test.ts
    MockProvider.test.ts
```

---

## Day 1: Project Scaffold and TypeScript Setup

### Objective

Create the initial TypeScript SDK structure so the project can build and run tests.

### Implementation Tasks

- Create `package.json` with scripts for build, test, typecheck, and lint if desired.
- Add TypeScript configuration in `tsconfig.json`.
- Add Vitest configuration in `vitest.config.ts`.
- Create `src/index.ts` as the SDK's public entry point.
- Create initial source folders:
  - `src/runtime/`
  - `src/providers/`
  - `src/types/`
- Create `tests/` for unit tests.
- Add or update `README.md` with the SDK purpose and Week 1 scope.

### Learning Goals

- Understand how a TypeScript SDK package is organized.
- Learn why libraries usually expose a clean public API through `src/index.ts`.
- Learn the difference between source files, test files, and package configuration.

### Acceptance Criteria

- `npm install` works.
- `npm run build` compiles TypeScript.
- `npm test` runs successfully, even if tests are minimal.
- The repository has a clear `src/` and `tests/` layout.

### Suggested Agent Prompt

```text
Please implement Day 1 from docs/week-1-runtime-foundation-plan.md. Scaffold the TypeScript SDK project, add build/test configuration, and keep the changes minimal and well tested.
```

---

## Day 2: Define Shared Request and Response Types

### Objective

Create stable runtime and provider contracts that match the PRD's Week 1 input and output requirements.

### Implementation Tasks

- Create `src/types/runtime.ts`.
- Create `src/types/provider.ts`.
- Create `src/types/errors.ts` if custom errors are useful.
- Define `AgentRunInput` with:
  - `input`
  - optional `instructions`
  - optional `context`
- Define `AgentRunResponse` with:
  - `text`
  - `metadata`
- Define provider request and response types.
- Export public types from `src/index.ts`.

### Example Runtime Types

```ts
export interface AgentRunInput {
  input: string;
  instructions?: string;
  context?: Record<string, unknown>;
}

export interface AgentRunMetadata {
  provider: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
}

export interface AgentRunResponse {
  text: string;
  metadata: AgentRunMetadata;
}
```

### Learning Goals

- Understand how SDKs define stable contracts for users.
- Learn why runtime-level types and provider-level types can be separate.
- Learn how normalized responses make future provider switching easier.

### Acceptance Criteria

- Types compile successfully.
- Runtime and provider types are clear and provider-agnostic.
- Public runtime types are exported from `src/index.ts`.
- No OpenAI-specific or vendor-specific names are introduced in Week 1 shared types.

### Suggested Agent Prompt

```text
Please implement Day 2 from docs/week-1-runtime-foundation-plan.md. Add shared runtime and provider types, export the public types, and add or update tests if needed.
```

---

## Day 3: Define Provider Interface and MockProvider

### Objective

Add the provider abstraction and a deterministic mock provider for local development and tests.

### Implementation Tasks

- Create `src/providers/Provider.ts`.
- Create `src/providers/MockProvider.ts`.
- Define a `Provider` interface with:
  - `name`
  - `generate(request)`
- Implement `MockProvider` using the provider interface.
- Export provider classes and types from `src/index.ts`.

### Example Provider Interface

```ts
import type { ProviderRequest, ProviderResponse } from "../types/provider";

export interface Provider {
  readonly name: string;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}
```

### Learning Goals

- Understand provider abstraction.
- Learn how a mock provider supports tests without external API calls.
- Learn why provider switching depends on a stable interface.

### Acceptance Criteria

- `MockProvider.generate()` returns a predictable provider response.
- The provider interface is vendor-neutral.
- The mock provider does not require network access or API keys.
- Provider tests pass.

### Suggested Agent Prompt

```text
Please implement Day 3 from docs/week-1-runtime-foundation-plan.md. Add the Provider interface, MockProvider, public exports, and tests for the mock provider.
```

---

## Day 4: Implement AgentRuntime

### Objective

Create the main runtime class that validates input, forwards requests to the provider, and normalizes responses.

### Implementation Tasks

- Create `src/runtime/AgentRuntime.ts`.
- Add `AgentRuntimeOptions` with a required provider.
- Validate that a provider is supplied.
- Implement `run(input)`.
- Validate that `input.input` is a non-empty string.
- Forward `input`, `instructions`, and `context` to the provider.
- Normalize provider responses into `AgentRunResponse`.
- Export `AgentRuntime` from `src/index.ts`.

### Learning Goals

- Understand runtime orchestration.
- Learn why the runtime should not know provider-specific API details.
- Learn how validation creates a better SDK developer experience.

### Acceptance Criteria

- Runtime initializes with `MockProvider`.
- Runtime throws a clear error if no provider is supplied.
- `runtime.run({ input: "hello" })` returns normalized text and metadata.
- Provider response data is mapped into SDK-level metadata.

### Suggested Agent Prompt

```text
Please implement Day 4 from docs/week-1-runtime-foundation-plan.md. Add AgentRuntime with input validation, provider forwarding, response normalization, exports, and tests.
```

---

## Day 5: Test Runtime Initialization and Request Forwarding

### Objective

Add focused tests proving that `AgentRuntime` initializes correctly and forwards requests to the configured provider.

### Implementation Tasks

- Add or update `tests/AgentRuntime.test.ts`.
- Test successful initialization with a provider.
- Test constructor failure when provider is missing.
- Test that `input`, `instructions`, and `context` are forwarded to the provider.
- Test that the normalized response includes provider metadata.

### Learning Goals

- Learn how to test behavior instead of implementation details.
- Learn how fake providers can capture forwarded requests.
- Learn how runtime tests differ from provider tests.

### Acceptance Criteria

- Tests prove constructor behavior.
- Tests prove request forwarding.
- Tests prove response normalization.
- Tests do not require real API keys or internet access.

### Suggested Agent Prompt

```text
Please implement Day 5 from docs/week-1-runtime-foundation-plan.md. Strengthen AgentRuntime tests for initialization, request forwarding, and normalized metadata.
```

---

## Day 6: Add Invalid Input and MockProvider Tests

### Objective

Improve confidence in error handling and mock provider behavior.

### Implementation Tasks

- Add invalid input tests for `AgentRuntime.run()`:
  - missing input object
  - empty input string
  - whitespace-only input string
  - non-string input, if runtime validation handles it
- Add or update `tests/MockProvider.test.ts`.
- Test that `MockProvider` returns deterministic text.
- Test that `MockProvider` includes usage metadata.
- Test that `MockProvider` includes a finish reason.
- Test that `MockProvider.name` is `mock`.

### Learning Goals

- Learn why SDKs need defensive validation.
- Learn how deterministic providers prevent flaky tests.
- Learn how clear error messages improve developer experience.

### Acceptance Criteria

- Invalid input tests pass.
- Mock provider tests pass.
- Error messages are clear and actionable.
- No tests depend on external services.

### Suggested Agent Prompt

```text
Please implement Day 6 from docs/week-1-runtime-foundation-plan.md. Add invalid input tests and complete MockProvider behavior tests.
```

---

## Day 7: Polish Public Exports and Documentation

### Objective

Make the Week 1 SDK easy to import, understand, and use.

### Implementation Tasks

- Update `src/index.ts` to export the intended public API only.
- Update `README.md` with:
  - project purpose
  - Week 1 capabilities
  - local installation/setup instructions
  - a minimal usage example
- Confirm README examples match the actual exported API.
- Run the full test and build suite.

### Example Public API

```ts
export { AgentRuntime } from "./runtime/AgentRuntime";
export { MockProvider } from "./providers/MockProvider";
export type { Provider } from "./providers/Provider";
export type {
  AgentRunInput,
  AgentRunMetadata,
  AgentRunResponse,
} from "./types/runtime";
```

### Example Usage

```ts
import { AgentRuntime, MockProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new MockProvider(),
});

const response = await runtime.run({
  input: "Write a welcome message",
  instructions: "Be concise",
});

console.log(response.text);
console.log(response.metadata);
```

### Learning Goals

- Learn how SDKs expose a small public surface area.
- Learn why users should avoid importing from internal paths.
- Learn how documentation validates whether the SDK design is understandable.

### Acceptance Criteria

- README usage example works with the actual API.
- `src/index.ts` exports only intended public SDK pieces.
- All Week 1 tests pass.
- Build succeeds.

### Suggested Agent Prompt

```text
Please implement Day 7 from docs/week-1-runtime-foundation-plan.md. Polish public exports, update README usage docs, and run the full test/build suite.
```

---

## End-of-Week Definition of Done

Week 1 is complete when this example works:

```ts
import { AgentRuntime, MockProvider } from "agent-runtime-sdk";

const runtime = new AgentRuntime({
  provider: new MockProvider(),
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
- The request is forwarded to the provider.
- The provider returns a deterministic response.
- The runtime normalizes that response.
- Tests confirm initialization, request forwarding, response normalization, and invalid input handling.

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

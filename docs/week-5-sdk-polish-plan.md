# Week 5 SDK Polish Plan

This plan breaks the PRD's Week 5 work into daily implementation tasks. Use it as the reference when asking the agent to perform each day's job.

## Week 5 Goal

Polish Agent Runtime SDK v0.1 into a reusable open-source SDK with middleware, retry/logging middleware, documentation, an example app, and CI coverage.

Week 5 deliverables:

- Middleware API
- Retry middleware
- Logging middleware
- README improvements
- Customer support example app
- CI pipeline
- Unit, integration, example application, and CI tests

By the end of Week 5, developers should be able to create an agent, plug in an LLM provider, register tools, execute requests, inspect traces, add middleware, and swap providers without changing application code.

## Target Project Structure

```text
agent-runtime-sdk/
  .github/
    workflows/
      ci.yml
  examples/
    customer-support/
      README.md
      package.json
      src/
        index.ts
  src/
    index.ts
    middleware/
      Middleware.ts
      composeMiddleware.ts
      loggingMiddleware.ts
      retryMiddleware.ts
    runtime/
      AgentRuntime.ts
  tests/
    middleware.test.ts
    retryMiddleware.test.ts
    loggingMiddleware.test.ts
    example.test.ts
```

---

## Day 1: Define Middleware API and Execution Hooks

### Objective

Create a middleware contract that lets SDK users observe or modify runtime execution without changing providers, tools, or application code.

### Implementation Tasks

- Add `src/middleware/Middleware.ts`.
- Define middleware context types for runtime input, provider request, provider response, trace, and errors.
- Define a middleware function signature with `context` and `next`.
- Decide which runtime phases middleware can wrap in v0.1.
- Keep middleware provider-agnostic.
- Export intended middleware types from `src/index.ts`.

### Learning Goals

- Understand middleware as extension points around SDK behavior.
- Learn how middleware avoids hard-coding logging, retries, or metrics into runtime logic.
- Learn why a small middleware contract is easier to support long term.

### Acceptance Criteria

- Middleware types compile successfully.
- Middleware can represent pre-run and post-run behavior.
- Middleware does not expose provider-specific internals.
- Existing tests continue to pass.

### Suggested Agent Prompt

```text
Please implement Day 1 from docs/week-5-sdk-polish-plan.md. Add provider-agnostic middleware types and public exports while preserving existing runtime behavior.
```

---

## Day 2: Compose Middleware into AgentRuntime

### Objective

Integrate middleware execution into `AgentRuntime` so users can add cross-cutting behavior while keeping the default runtime path simple.

### Implementation Tasks

- Add `src/middleware/composeMiddleware.ts`.
- Extend `AgentRuntimeOptions` to accept middleware.
- Compose middleware around the runtime execution path.
- Ensure middleware runs in the order it is registered.
- Ensure `next()` can only be called safely according to the chosen contract.
- Add `tests/middleware.test.ts`.

### Learning Goals

- Understand middleware composition and ordering.
- Learn how to protect against double-calling `next()`.
- Learn how to test extension points without relying on implementation details.

### Acceptance Criteria

- Runtime works with zero middleware.
- Runtime executes one middleware correctly.
- Runtime executes multiple middleware in deterministic order.
- Middleware can observe successful responses and errors.
- Middleware tests pass.

### Suggested Agent Prompt

```text
Please implement Day 2 from docs/week-5-sdk-polish-plan.md. Compose middleware into AgentRuntime with deterministic ordering and focused tests.
```

---

## Day 3: Add Retry Middleware

### Objective

Provide a reusable retry middleware for transient provider failures without forcing every SDK user to implement retry logic manually.

### Implementation Tasks

- Add `src/middleware/retryMiddleware.ts`.
- Define retry options such as `maxAttempts`, `baseDelayMs`, and retryable error predicate.
- Retry only retryable failures.
- Avoid retrying validation errors or non-idempotent tool execution unless explicitly supported.
- Add deterministic tests using fake timers or injected delay functions.
- Export retry middleware from `src/index.ts`.

### Learning Goals

- Understand transient failure handling in SDKs.
- Learn why retry policies need clear boundaries.
- Learn how fake timers or injected delays keep retry tests fast.

### Acceptance Criteria

- Retry middleware retries provider failures according to configuration.
- Retry middleware stops after the configured maximum attempts.
- Non-retryable errors are not retried.
- Retry tests are deterministic and fast.

### Suggested Agent Prompt

```text
Please implement Day 3 from docs/week-5-sdk-polish-plan.md. Add configurable retry middleware with deterministic tests and public exports.
```

---

## Day 4: Add Logging Middleware

### Objective

Provide a reusable logging middleware that helps users inspect runtime execution without committing to a specific logging library.

### Implementation Tasks

- Add `src/middleware/loggingMiddleware.ts`.
- Accept a logger interface with methods such as `debug`, `info`, `warn`, and `error`.
- Log run start, run success, run failure, provider metadata, and duration when available.
- Avoid logging secrets, API keys, or full sensitive context by default.
- Add `tests/loggingMiddleware.test.ts`.
- Export logging middleware from `src/index.ts`.

### Learning Goals

- Understand safe SDK logging practices.
- Learn how logger injection avoids hard dependencies.
- Learn why logs and execution traces serve different purposes.

### Acceptance Criteria

- Logging middleware uses the injected logger.
- Successful runs are logged.
- Failed runs are logged.
- Sensitive fields are not logged by default.
- Logging middleware tests pass.

### Suggested Agent Prompt

```text
Please implement Day 4 from docs/week-5-sdk-polish-plan.md. Add safe logging middleware with injected logger support, exports, and unit tests.
```

---

## Day 5: Build Customer Support Example App

### Objective

Create a small example application that demonstrates the SDK's full v0.1 workflow in a realistic customer support scenario.

### Implementation Tasks

- Add `examples/customer-support/`.
- Create an example README explaining setup and usage.
- Demonstrate `AgentRuntime` with a provider.
- Register at least one customer support tool, such as order lookup or refund policy lookup.
- Show middleware usage for logging or retries.
- Print final response, tools used, and trace events.
- Keep the example runnable with `MockProvider` by default.

### Learning Goals

- Understand how examples validate SDK usability end to end.
- Learn how to demonstrate advanced features without requiring real credentials.
- Learn how example apps guide new users faster than API references alone.

### Acceptance Criteria

- Example app can run locally with the mock provider.
- Example documents how to switch to `OpenAIProvider` when an API key is available.
- Example prints response text, tool usage, and trace summary.
- No secrets are committed.

### Suggested Agent Prompt

```text
Please implement Day 5 from docs/week-5-sdk-polish-plan.md. Add a customer support example app that runs with MockProvider by default and demonstrates tools, middleware, and traces.
```

---

## Day 6: Add CI Pipeline and Quality Gates

### Objective

Add continuous integration so the SDK is automatically checked for installability, type safety, tests, and build output.

### Implementation Tasks

- Add `.github/workflows/ci.yml`.
- Run on pull requests and pushes to the main branch.
- Install dependencies with the repository's package manager.
- Run typecheck.
- Run unit tests.
- Run build.
- Optionally run example app checks that do not require secrets.
- Keep live OpenAI integration tests gated by secrets and disabled by default.

### Learning Goals

- Understand how CI protects open-source SDK quality.
- Learn why secret-dependent tests should not block ordinary pull requests.
- Learn how CI documents the supported validation workflow.

### Acceptance Criteria

- CI workflow is committed under `.github/workflows/ci.yml`.
- CI runs typecheck, tests, and build.
- CI does not require `OPENAI_API_KEY` by default.
- Local commands match CI commands.

### Suggested Agent Prompt

```text
Please implement Day 6 from docs/week-5-sdk-polish-plan.md. Add a GitHub Actions CI workflow for install, typecheck, tests, build, and mock-only example checks.
```

---

## Day 7: Final README, API Review, and Release Readiness

### Objective

Finalize the SDK documentation and public API for the v0.1 milestone.

### Implementation Tasks

- Review `src/index.ts` and remove unintended exports.
- Update `README.md` with:
  - installation
  - quick start
  - provider setup
  - tool calling
  - traces
  - middleware
  - example app
  - testing and CI commands
- Ensure examples match real code.
- Run the full local quality suite.
- Review package metadata in `package.json`.
- Confirm no secrets, build artifacts, or temporary files are committed.

### Learning Goals

- Understand release readiness for a TypeScript SDK.
- Learn how documentation, examples, and CI combine into production-quality polish.
- Learn how to keep the public API stable and intentional.

### Acceptance Criteria

- README clearly explains the full v0.1 workflow.
- Public exports are intentional and documented.
- Example app works with `MockProvider`.
- Unit tests, integration-safe tests, typecheck, and build pass.
- CI configuration matches local validation commands.

### Suggested Agent Prompt

```text
Please implement Day 7 from docs/week-5-sdk-polish-plan.md. Finalize README, public exports, package metadata, examples, and release readiness checks for v0.1.
```

---

## End-of-Week Definition of Done

Week 5 is complete when this v0.1 workflow is documented, tested, and runnable:

```ts
import {
  AgentRuntime,
  MockProvider,
  ToolRegistry,
  loggingMiddleware,
  retryMiddleware,
} from "agent-runtime-sdk";

const tools = new ToolRegistry([
  {
    definition: {
      name: "lookupCustomer",
      description: "Look up a customer by ID.",
    },
    execute: async ({ customerId }) => ({ customerId, tier: "gold" }),
  },
]);

const runtime = new AgentRuntime({
  provider: new MockProvider(),
  tools,
  middleware: [loggingMiddleware(), retryMiddleware({ maxAttempts: 2 })],
});

const result = await runtime.run({
  input: "Help customer 123 with their latest order",
});

console.log(result.text);
console.log(result.metadata.toolsUsed);
console.log(result.metadata.trace);
```

Expected behavior:

- The SDK has a clear public API.
- Middleware can wrap runtime behavior.
- Retry and logging middleware are available.
- The example app demonstrates a customer support workflow.
- CI runs install, typecheck, tests, and build.
- README explains the complete v0.1 developer journey.

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

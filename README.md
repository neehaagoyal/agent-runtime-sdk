# Agent Runtime SDK

Agent Runtime SDK is a TypeScript SDK foundation for running agent requests through a provider-agnostic runtime API.

## Week 1 Scope

Week 1 establishes the runtime foundation for version `0.1.0`:

- A TypeScript package scaffold with build and test scripts.
- A clean public entry point in `src/index.ts`.
- Shared runtime request and response types.
- Shared provider request and response types.
- A base runtime error type for clear SDK errors.

Later Week 1 tasks will add the provider interface, mock provider, runtime orchestration, and behavior tests.

## Project Layout

```text
src/
  index.ts
  runtime/
  providers/
  types/
    errors.ts
    provider.ts
    runtime.ts
tests/
  types.test.ts
```

## Local Development

Install dependencies:

```sh
npm install
```

Build the SDK:

```sh
npm run build
```

Run tests:

```sh
npm test
```

Run type checking:

```sh
npm run typecheck
```

# @uniforma/core

This package is the framework-agnostic core for Uniforma.

## Design Rules

- Keep the package DOM-free. Do not add `HTMLFormElement`, `FormData`, browser events, or framework reactivity here.
- Do not reintroduce stores, subscriptions, field-store objects, or component-facing reactive primitives.
- The core API is MVC-style:
  - Model: nested form value seeded by `initialValue`
  - View metadata: Standard JSON Schema / normalized schema
  - Controller: validation and flat-field conversion
- Public field paths use JSON Pointer only. Do not add dot/bracket path APIs back as first-class paths.
- Validation is driven by Standard Schema. Rendering metadata is driven by Standard JSON Schema.

## Core Responsibilities

- Build and expose schema metadata through `getInputJsonSchema()` and `normalizeJsonSchema()`.
- Convert nested values to flat JSON Pointer maps and back.
- Keep `inflate()` schema-aware so scalars are reconstructed correctly for booleans, numbers, arrays, enums, and nulls.
- Map Standard Schema issue paths to JSON Pointer so UI packages can match errors to fields.
- Keep the controller small. It should answer:
  - what the initial flat fields are
  - how to flatten/inflate values
  - how to validate
  - whether an event should trigger validation

## Dependency Rules

- Prefer small wrappers around third-party libraries instead of exposing library-specific APIs directly.
- `json-pointer` is an implementation detail. Keep Uniforma-specific helpers in `paths.ts` and `values.ts`.
- Avoid adding framework or state-management dependencies here.

## Editing Guidance

- Favor pure functions and serializable data structures.
- Keep exported types aligned with the actual public API in `src/index.ts`.
- If you change pointer semantics, update both path helpers and tests together.
- If you change inflation or coercion rules, update tests in `tests/values.test.ts` and `tests/controller.test.ts`.

## Validation

- Run `vp check` and `vp test` after changes.

# Workflow

## Commands

- `vpr build`: Only for build/bundler issues or verifying production output
- `vpr lint`: Covers both type-aware linting and type checking. No need to run `tsc --noEmit`
- `vpr dev` runs indefinitely in watch mode
- `vpr db` for Drizzle Kit commands (e.g. `vpr db generate` to generate a migration)

Don't build after every change. If lint passes; assume changes work.

## Testing

Vitest runs via `vpr test` (config in the `test` block of `vite.config.ts`; test files are `src/**/*.test.ts`).

- Import test APIs from `vite-plus/test`, NOT `vitest` (Vite+ re-exports vitest and the `vitest` package is not installed): `import { describe, expect, it } from "vite-plus/test"`
- Test pure logic (schemas, query/filter functions, formatters) — see `src/lib/demo/customers.test.ts`. Keep components thin enough that their logic is testable this way.
- CI runs check + test + build on every push/PR (`.github/workflows/ci.yml`).

## Formatting

Oxfmt (via Vite+) is configured for consistent code formatting via `vpr format`. It runs automatically on commit via Vite+ pre-commit hooks, so manual formatting is not necessary.

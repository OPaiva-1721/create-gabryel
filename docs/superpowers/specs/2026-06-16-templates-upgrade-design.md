# Templates Upgrade — Design

## Context

`create-gabryel` CLI scaffolds 3 templates: `ddd` (NestJS DDD), `react`, `monorepo` (turborepo: Nest API + React web). All 3 are currently minimal: 1 example module, no tests, no lint/format config. This spec adds structure, testing, and lint/format to all 3 templates.

## Goals

- Add a `health` module/endpoint to every NestJS app generated (DDD template and `apps/api` in monorepo).
- Add test setup + one example test to every template.
- Add ESLint flat config + Prettier to every template.
- Add a richer `src/` folder structure to React templates.
- Add shared `packages/types` and `packages/config` (tsconfig only) to the monorepo template.
- Update `turbo.json` with `test` and `lint` pipelines.

## Non-goals

- No shared ESLint config across Nest/React in the monorepo (different plugin needs — react-hooks vs Nest decorators). Each app keeps its own `eslint.config.js`.
- No CI/CD (GitHub Actions) or Docker setup — out of scope for this pass.
- No additional DDD building blocks (value objects, domain exceptions, env validation) beyond the `health` module — kept to what the user explicitly asked for.

## Template: DDD (NestJS)

### Structure
- New module: `src/modules/health/health.module.ts`, `health.controller.ts` — `GET /health` returns `{ status: 'ok' }`. No external dependencies (no DB ping) — keep it a liveness check only.
- Wire `HealthModule` into `app.module.ts` imports.

### Testing
- Add `jest` config (NestJS default: `package.json` `jest` block already standard, but verify wired correctly) plus `@nestjs/testing`.
- Unit test: `src/modules/example/application/use-cases/create-example.use-case.spec.ts` — tests the use case against the in-memory repository.
- E2E test: `test/health.e2e-spec.ts` — boots the Nest app, hits `GET /health`, asserts 200 + body.
- Scripts: `"test": "jest"`, `"test:e2e": "jest --config ./test/jest-e2e.json"`.

### Lint/Format
- `eslint.config.js` (flat config) using `@eslint/js`, `typescript-eslint`, `eslint-plugin-prettier` recommended-with-prettier setup, or `eslint-config-prettier` to disable conflicting stylistic rules — Prettier owns formatting.
- `.prettierrc` with project defaults (semi, singleQuote, trailingComma).
- Scripts: `"lint": "eslint \"src/**/*.ts\""`, `"format": "prettier --write \"src/**/*.ts\""`.

## Template: React (solo)

### Structure
New folders under `src/`:
- `components/` — shared presentational components.
- `hooks/` — custom hooks.
- `services/` — API call wrappers (fetch/axios).
- `pages/` — route-level components. Includes `Home.tsx` as the example page.
- `lib/` — generic utils/helpers.

### Routing
- Add `react-router-dom` dependency.
- `App.tsx` renders a `<BrowserRouter>` with one route (`/`) pointing to `pages/Home.tsx`.

### Testing
- Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as devDependencies.
- `vite.config.ts` extended with `test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.ts' }`.
- `src/setupTests.ts` imports `@testing-library/jest-dom`.
- Example test: `src/pages/Home.test.tsx` renders `Home` and asserts visible text.
- Script: `"test": "vitest run"`.

### Lint/Format
- `eslint.config.js` (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`.
- `.prettierrc` matching the DDD template's settings (consistent style across templates).
- Scripts: `"lint": "eslint \"src/**/*.{ts,tsx}\""`, `"format": "prettier --write \"src/**/*.{ts,tsx}\""`.

## Template: Monorepo

### `apps/api`
Mirrors the full DDD template structure (not a simplified version): same `src/modules/example/{domain,application,infra}` layers, same `src/shared/domain/entity.base.ts`, same new `health` module, same Jest unit + e2e tests, same `eslint.config.js` + Prettier as the DDD template.

### `apps/web`
Mirrors the full React template structure: `components/hooks/services/pages/lib`, routing, Vitest + Testing Library setup, same `eslint.config.js` (React flavor) + Prettier as the React template.

### `packages/types`
- New workspace package, `@repo/types` (or repo-appropriate scope), exporting shared TS interfaces (e.g. a placeholder `ExampleDto` type) consumed by both `apps/api` and `apps/web` via `workspace:*` dependency.
- Minimal `package.json` + `tsconfig.json` + `src/index.ts`.

### `packages/config`
- Contains only `tsconfig.base.json` — a shared compiler-options base (`strict`, `target`, `module` settings common to both apps).
- No shared ESLint config (see Non-goals) — each app extends `tsconfig.base.json` via `"extends": "../../packages/config/tsconfig.base.json"` in its own `tsconfig.json`, but keeps its own ESLint flat config with app-appropriate plugins.

### `turbo.json`
- Add `test` pipeline: depends on `^build` (or no deps if tests don't need build output), `outputs: []`.
- Add `lint` pipeline: no dependencies, `outputs: []`.

### Root `package.json`
- Add root scripts `"test": "turbo run test"`, `"lint": "turbo run lint"` so a single command fans out to every workspace.

## Testing Strategy (meta)

After implementation, validate by:
1. Running the CLI to scaffold a project from each of the 3 templates into a temp directory.
2. For each scaffolded project: `npm install`, then run `lint` and `test` scripts, confirm they pass with the example code (no real feature added — just the example).
3. For monorepo: confirm `apps/api` boots and `GET /health` returns 200; confirm `apps/web` builds and renders the `Home` route.

## Open questions

None — all decisions confirmed with user during brainstorming.

# Templates Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add health endpoints, test setups (Jest/Vitest), ESLint flat config + Prettier, and richer folder structure to all 3 CLI templates (`ddd`, `react`, `monorepo`), per `docs/superpowers/specs/2026-06-16-templates-upgrade-design.md`.

**Architecture:** Templates are static file trees copied verbatim by `copyTemplate()` (`src/copy-template.ts`) into the user's target directory — no placeholder substitution happens. Every file added here is exactly what a scaffolded project will contain. Validation is done by actually scaffolding a project into a temp dir and running its scripts (`test`, `lint`, `build`), since the templates themselves have no executable logic until copied out.

**Tech Stack:** NestJS 10 (Fastify adapter) + Jest + `@nestjs/testing` for `ddd` and `apps/api`; Vite + React 19 + Vitest + Testing Library + `react-router-dom` for `react` and `apps/web`; ESLint 9 flat config + `typescript-eslint` + Prettier across all; Turborepo + pnpm workspaces for `monorepo`.

---

## File Structure Overview

**`templates/ddd/`** (new/modified):
- `src/modules/health/health.module.ts`, `health.controller.ts` — new
- `src/app.module.ts` — modified (import `HealthModule`)
- `src/modules/example/application/use-cases/create-example.use-case.spec.ts` — new
- `test/health.e2e-spec.ts`, `test/jest-e2e.json` — new
- `package.json` — modified (devDeps + scripts)
- `eslint.config.js`, `.prettierrc` — new

**`templates/react/`** (new/modified):
- `src/components/.gitkeep`, `src/hooks/.gitkeep`, `src/services/.gitkeep`, `src/lib/.gitkeep` — new (empty dirs need a placeholder file to survive git/copy)
- `src/pages/Home.tsx`, `src/pages/Home.test.tsx` — new
- `src/App.tsx` — modified (router)
- `src/setupTests.ts` — new
- `vite.config.ts` — modified (test config)
- `package.json` — modified (deps + devDeps + scripts)
- `eslint.config.js`, `.prettierrc` — new

**`templates/monorepo/apps/api/`** (replaces flat structure with full DDD layout, mirroring `templates/ddd`):
- `src/modules/example/**` — new (same layered files as `templates/ddd`)
- `src/modules/health/**` — new
- `src/shared/domain/entity.base.ts` — new
- `src/app.module.ts` — modified
- `src/health.controller.ts` — deleted (replaced by `modules/health`)
- `test/health.e2e-spec.ts`, `test/jest-e2e.json`, `src/modules/example/application/use-cases/create-example.use-case.spec.ts` — new
- `package.json` — modified
- `eslint.config.js`, `.prettierrc` — new

**`templates/monorepo/apps/web/`** (mirrors `templates/react`):
- same new files as `templates/react` section above, scoped to `apps/web`

**`templates/monorepo/packages/types/`** — new package
**`templates/monorepo/packages/config/`** — new package (tsconfig only)
**`templates/monorepo/turbo.json`, `package.json`** — modified

---

## Task 1: DDD — health module

**Files:**
- Create: `templates/ddd/src/modules/health/health.controller.ts`
- Create: `templates/ddd/src/modules/health/health.module.ts`
- Modify: `templates/ddd/src/app.module.ts`

- [ ] **Step 1: Create the health controller**

`templates/ddd/src/modules/health/health.controller.ts`:
```ts
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
```

- [ ] **Step 2: Create the health module**

`templates/ddd/src/modules/health/health.module.ts`:
```ts
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 3: Wire HealthModule into AppModule**

Modify `templates/ddd/src/app.module.ts` to:
```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleModule } from "./modules/example/example.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ExampleModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Commit**

```bash
git add templates/ddd/src/modules/health templates/ddd/src/app.module.ts
git commit -m "feat(ddd-template): add health module"
```

---

## Task 2: DDD — Jest setup + unit test

**Files:**
- Modify: `templates/ddd/package.json`
- Create: `templates/ddd/src/modules/example/application/use-cases/create-example.use-case.spec.ts`

- [ ] **Step 1: Add Jest devDependencies and config to package.json**

Modify `templates/ddd/package.json` — add to `devDependencies`:
```json
"@nestjs/testing": "^10.0.0",
"@types/jest": "^29.5.0",
"jest": "^29.7.0",
"ts-jest": "^29.1.0"
```

Add `"test": "jest"` to `scripts` (after `"db:studio"` line) and add a top-level `jest` config block:
```json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

Resulting `templates/ddd/package.json`:
```json
{
  "name": "my-nestjs-ddd-app",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"src/**/*.ts\"",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-fastify": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.21.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

(Note: `test:e2e`, `lint`, `format` scripts reference files created in Tasks 3 and 5 — they're added here together since they all live in the same `scripts` block and splitting the edit across tasks would mean re-editing the same lines twice.)

- [ ] **Step 2: Write the unit test**

`templates/ddd/src/modules/example/application/use-cases/create-example.use-case.spec.ts`:
```ts
import { CreateExampleUseCase } from "./create-example.use-case";
import { InMemoryExampleRepository } from "../../infra/database/in-memory-example.repository";

describe("CreateExampleUseCase", () => {
  it("creates an example and persists it in the repository", async () => {
    const repository = new InMemoryExampleRepository();
    const useCase = new CreateExampleUseCase(repository);

    const result = await useCase.execute({ name: "Test Example" });

    expect(result.id).toBeDefined();
    const saved = await repository.findById(result.id);
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Test Example");
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add templates/ddd/package.json templates/ddd/src/modules/example/application/use-cases/create-example.use-case.spec.ts
git commit -m "feat(ddd-template): add jest setup and use-case unit test"
```

---

## Task 3: DDD — e2e test for health

**Files:**
- Create: `templates/ddd/test/jest-e2e.json`
- Create: `templates/ddd/test/health.e2e-spec.ts`

- [ ] **Step 1: Create the e2e jest config**

`templates/ddd/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

- [ ] **Step 2: Write the e2e test**

`templates/ddd/test/health.e2e-spec.ts`:
```ts
import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "../src/app.module";

describe("HealthController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns status ok", async () => {
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: "ok" });
  });
});
```

(Note: this test hits `/health`, not `/api/health` — it builds the Nest app directly via `TestingModule` without calling the `setGlobalPrefix("api")` line from `main.ts`, since that's bootstrap-only code not part of `AppModule`.)

- [ ] **Step 3: Commit**

```bash
git add templates/ddd/test
git commit -m "feat(ddd-template): add health e2e test"
```

---

## Task 4: DDD — ESLint flat config + Prettier

**Files:**
- Create: `templates/ddd/eslint.config.js`
- Create: `templates/ddd/.prettierrc`

- [ ] **Step 1: Create the ESLint flat config**

`templates/ddd/eslint.config.js`:
```js
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
```

- [ ] **Step 2: Create the Prettier config**

`templates/ddd/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 3: Commit**

```bash
git add templates/ddd/eslint.config.js templates/ddd/.prettierrc
git commit -m "feat(ddd-template): add eslint flat config and prettier"
```

---

## Task 5: DDD — integration validation

**Files:** none (validation only, no template files change)

- [ ] **Step 1: Build the CLI**

```bash
npm run build
```
Expected: `tsup` succeeds, `dist/index.js` produced.

- [ ] **Step 2: Scaffold a DDD project into a temp dir**

The CLI prompts to confirm dependency install — pipe `n` to skip it (we install manually next step):
```bash
mkdir -p /tmp/cgcheck && cd /tmp/cgcheck && echo n | node "$OLDPWD/dist/index.js" ddd-check --ddd
```

- [ ] **Step 3: Install and run tests**

```bash
cd /tmp/cgcheck/ddd-check && npm install && npm run test && npm run test:e2e && npm run lint
```
Expected: unit test passes (`CreateExampleUseCase`), e2e test passes (`GET /health` → `{status:"ok"}`), lint exits 0.

- [ ] **Step 4: Clean up**

```bash
cd "$OLDPWD" && rm -rf /tmp/cgcheck
```

---

## Task 6: React — folder structure + Home page

**Files:**
- Create: `templates/react/src/pages/Home.tsx`
- Create: `templates/react/src/components/.gitkeep`
- Create: `templates/react/src/hooks/.gitkeep`
- Create: `templates/react/src/services/.gitkeep`
- Create: `templates/react/src/lib/.gitkeep`
- Modify: `templates/react/src/App.tsx`

- [ ] **Step 1: Create empty-folder placeholders**

`templates/react/src/components/.gitkeep`, `templates/react/src/hooks/.gitkeep`, `templates/react/src/services/.gitkeep`, `templates/react/src/lib/.gitkeep` — each an empty file (git/`cpSync` don't track/copy empty directories without a file in them).

- [ ] **Step 2: Create the Home page**

`templates/react/src/pages/Home.tsx`:
```tsx
export function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>🚀 Meu App</h1>
      <p>
        Criado com <strong>create-gabryel</strong> — React 19 + Vite +
        TypeScript
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Update App.tsx to render Home directly (routing added in Task 7)**

Modify `templates/react/src/App.tsx`:
```tsx
import { Home } from "./pages/Home";

export function App() {
  return <Home />;
}
```

- [ ] **Step 4: Commit**

```bash
git add templates/react/src
git commit -m "feat(react-template): add folder structure and Home page"
```

---

## Task 7: React — routing

**Files:**
- Modify: `templates/react/package.json`
- Modify: `templates/react/src/App.tsx`

- [ ] **Step 1: Add react-router-dom dependency**

Modify `templates/react/package.json` `dependencies`:
```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.26.0"
}
```

- [ ] **Step 2: Wire BrowserRouter into App.tsx**

Modify `templates/react/src/App.tsx`:
```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add templates/react/package.json templates/react/src/App.tsx
git commit -m "feat(react-template): add react-router-dom routing"
```

---

## Task 8: React — Vitest + Testing Library setup

**Files:**
- Modify: `templates/react/package.json`
- Modify: `templates/react/vite.config.ts`
- Create: `templates/react/src/setupTests.ts`
- Create: `templates/react/src/pages/Home.test.tsx`

- [ ] **Step 1: Add test devDependencies and script**

Modify `templates/react/package.json`:
```json
{
  "name": "my-react-app",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "jsdom": "^25.0.0",
    "prettier": "^3.3.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^5.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Extend vite.config.ts with test config**

Modify `templates/react/vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

- [ ] **Step 3: Create the test setup file**

`templates/react/src/setupTests.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Write the example test**

`templates/react/src/pages/Home.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the welcome heading", () => {
    render(<Home />);
    expect(screen.getByText("🚀 Meu App")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add templates/react/package.json templates/react/vite.config.ts templates/react/src/setupTests.ts templates/react/src/pages/Home.test.tsx
git commit -m "feat(react-template): add vitest and testing-library setup"
```

---

## Task 9: React — ESLint flat config + Prettier

**Files:**
- Create: `templates/react/eslint.config.js`
- Create: `templates/react/.prettierrc`

- [ ] **Step 1: Create the ESLint flat config**

`templates/react/eslint.config.js`:
```js
const tseslint = require("typescript-eslint");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  eslintConfigPrettier,
);
```

- [ ] **Step 2: Create the Prettier config**

`templates/react/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 3: Commit**

```bash
git add templates/react/eslint.config.js templates/react/.prettierrc
git commit -m "feat(react-template): add eslint flat config and prettier"
```

---

## Task 10: React — integration validation

**Files:** none (validation only)

- [ ] **Step 1: Build the CLI**
```bash
npm run build
```

- [ ] **Step 2: Scaffold a React project into a temp dir**
```bash
mkdir -p /tmp/cgcheck2 && cd /tmp/cgcheck2 && echo n | node "$OLDPWD/dist/index.js" react-check --react
```

- [ ] **Step 3: Install and run tests**
```bash
cd /tmp/cgcheck2/react-check && npm install && npm run test && npm run lint && npm run build
```
Expected: `Home.test.tsx` passes, lint exits 0, `tsc && vite build` succeeds.

- [ ] **Step 4: Clean up**
```bash
cd "$OLDPWD" && rm -rf /tmp/cgcheck2
```

---

## Task 11: Monorepo `apps/api` — port full DDD layout

**Files:**
- Create: `templates/monorepo/apps/api/src/shared/domain/entity.base.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/domain/entities/example.entity.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/domain/repositories/example.repository.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/application/use-cases/create-example.use-case.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/infra/database/in-memory-example.repository.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/infra/http/controllers/example.controller.ts`
- Create: `templates/monorepo/apps/api/src/modules/example/example.module.ts`
- Create: `templates/monorepo/apps/api/src/modules/health/health.controller.ts`
- Create: `templates/monorepo/apps/api/src/modules/health/health.module.ts`
- Modify: `templates/monorepo/apps/api/src/app.module.ts`
- Delete: `templates/monorepo/apps/api/src/health.controller.ts`

These are identical in content to the `templates/ddd` equivalents (read each file under `templates/ddd/src/shared/` and `templates/ddd/src/modules/` before writing — they must match exactly, this is a straight port with no DDD-template-specific dependency like `drizzle`/`zod` since `apps/api`'s `package.json` doesn't have those).

- [ ] **Step 1: Copy `entity.base.ts`**

`templates/monorepo/apps/api/src/shared/domain/entity.base.ts` — read `templates/ddd/src/shared/domain/entity.base.ts` and copy verbatim.

- [ ] **Step 2: Copy the `example` module's domain/application/infra files**

Read and copy verbatim, file by file:
- `templates/ddd/src/modules/example/domain/entities/example.entity.ts` → `templates/monorepo/apps/api/src/modules/example/domain/entities/example.entity.ts`
- `templates/ddd/src/modules/example/domain/repositories/example.repository.ts` → `templates/monorepo/apps/api/src/modules/example/domain/repositories/example.repository.ts`
- `templates/ddd/src/modules/example/application/use-cases/create-example.use-case.ts` → `templates/monorepo/apps/api/src/modules/example/application/use-cases/create-example.use-case.ts`
- `templates/ddd/src/modules/example/infra/database/in-memory-example.repository.ts` → `templates/monorepo/apps/api/src/modules/example/infra/database/in-memory-example.repository.ts`
- `templates/ddd/src/modules/example/infra/http/controllers/example.controller.ts` → `templates/monorepo/apps/api/src/modules/example/infra/http/controllers/example.controller.ts`
- `templates/ddd/src/modules/example/example.module.ts` → `templates/monorepo/apps/api/src/modules/example/example.module.ts`

- [ ] **Step 3: Create the health module (same content as Task 1)**

`templates/monorepo/apps/api/src/modules/health/health.controller.ts`:
```ts
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
```

`templates/monorepo/apps/api/src/modules/health/health.module.ts`:
```ts
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 4: Delete the old flat health controller**

```bash
rm templates/monorepo/apps/api/src/health.controller.ts
```

- [ ] **Step 5: Update app.module.ts**

`templates/monorepo/apps/api/src/app.module.ts`:
```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleModule } from "./modules/example/example.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ExampleModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Commit**

```bash
git add templates/monorepo/apps/api/src
git commit -m "feat(monorepo-template): port full DDD layout into apps/api"
```

---

## Task 12: Monorepo `apps/api` — Jest setup + tests + ESLint/Prettier

**Files:**
- Modify: `templates/monorepo/apps/api/package.json`
- Create: `templates/monorepo/apps/api/src/modules/example/application/use-cases/create-example.use-case.spec.ts`
- Create: `templates/monorepo/apps/api/test/jest-e2e.json`
- Create: `templates/monorepo/apps/api/test/health.e2e-spec.ts`
- Create: `templates/monorepo/apps/api/eslint.config.js`
- Create: `templates/monorepo/apps/api/.prettierrc`

- [ ] **Step 1: Update package.json (deps, scripts, jest config)**

`templates/monorepo/apps/api/package.json`:
```json
{
  "name": "@myapp/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"src/**/*.ts\"",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-fastify": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.21.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Write the unit test (identical to Task 2 Step 2)**

`templates/monorepo/apps/api/src/modules/example/application/use-cases/create-example.use-case.spec.ts`:
```ts
import { CreateExampleUseCase } from "./create-example.use-case";
import { InMemoryExampleRepository } from "../../infra/database/in-memory-example.repository";

describe("CreateExampleUseCase", () => {
  it("creates an example and persists it in the repository", async () => {
    const repository = new InMemoryExampleRepository();
    const useCase = new CreateExampleUseCase(repository);

    const result = await useCase.execute({ name: "Test Example" });

    expect(result.id).toBeDefined();
    const saved = await repository.findById(result.id);
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Test Example");
  });
});
```

- [ ] **Step 3: Write the e2e jest config and test (identical to Task 3)**

`templates/monorepo/apps/api/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

`templates/monorepo/apps/api/test/health.e2e-spec.ts`:
```ts
import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "../src/app.module";

describe("HealthController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns status ok", async () => {
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 4: ESLint + Prettier configs (identical to Task 4)**

`templates/monorepo/apps/api/eslint.config.js`:
```js
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
```

`templates/monorepo/apps/api/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 5: Commit**

```bash
git add templates/monorepo/apps/api
git commit -m "feat(monorepo-template): add jest, eslint, prettier to apps/api"
```

---

## Task 13: Monorepo `apps/web` — mirror React template

**Files:**
- Create: `templates/monorepo/apps/web/src/pages/Home.tsx`
- Create: `templates/monorepo/apps/web/src/pages/Home.test.tsx`
- Create: `templates/monorepo/apps/web/src/components/.gitkeep`, `src/hooks/.gitkeep`, `src/services/.gitkeep`, `src/lib/.gitkeep`
- Modify: `templates/monorepo/apps/web/src/App.tsx`
- Modify: `templates/monorepo/apps/web/package.json`
- Modify: `templates/monorepo/apps/web/vite.config.ts`
- Create: `templates/monorepo/apps/web/src/setupTests.ts`
- Create: `templates/monorepo/apps/web/eslint.config.js`
- Create: `templates/monorepo/apps/web/.prettierrc`

- [ ] **Step 1: Create folder placeholders**

Empty files: `templates/monorepo/apps/web/src/components/.gitkeep`, `src/hooks/.gitkeep`, `src/services/.gitkeep`, `src/lib/.gitkeep`.

- [ ] **Step 2: Create Home page (web-specific copy text)**

`templates/monorepo/apps/web/src/pages/Home.tsx`:
```tsx
export function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Web</h1>
      <p>
        Monorepo app criado com <strong>create-gabryel</strong>
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Update App.tsx with routing**

`templates/monorepo/apps/web/src/App.tsx`:
```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Update package.json**

`templates/monorepo/apps/web/package.json`:
```json
{
  "name": "@myapp/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "jsdom": "^25.0.0",
    "prettier": "^3.3.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^5.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 5: Update vite.config.ts and add setupTests.ts**

`templates/monorepo/apps/web/vite.config.ts` — read the current file first (likely identical to `templates/react/vite.config.ts` minus the `@` alias, or with it — check before editing) and add the same `test` block as Task 8 Step 2:
```ts
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/setupTests.ts",
},
```

`templates/monorepo/apps/web/src/setupTests.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 6: Add the example test**

`templates/monorepo/apps/web/src/pages/Home.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the Web heading", () => {
    render(<Home />);
    expect(screen.getByText("Web")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Add ESLint + Prettier (identical to Task 9)**

`templates/monorepo/apps/web/eslint.config.js`:
```js
const tseslint = require("typescript-eslint");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  eslintConfigPrettier,
);
```

`templates/monorepo/apps/web/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 8: Commit**

```bash
git add templates/monorepo/apps/web
git commit -m "feat(monorepo-template): mirror react template into apps/web"
```

---

## Task 14: Monorepo — packages/types and packages/config

**Files:**
- Create: `templates/monorepo/packages/types/package.json`
- Create: `templates/monorepo/packages/types/tsconfig.json`
- Create: `templates/monorepo/packages/types/src/index.ts`
- Create: `templates/monorepo/packages/config/package.json`
- Create: `templates/monorepo/packages/config/tsconfig.base.json`

- [ ] **Step 1: Create packages/types**

`templates/monorepo/packages/types/package.json`:
```json
{
  "name": "@repo/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

`templates/monorepo/packages/types/tsconfig.json`:
```json
{
  "extends": "../config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

`templates/monorepo/packages/types/src/index.ts`:
```ts
export interface ExampleDto {
  id: string;
  name: string;
  createdAt: string;
}
```

- [ ] **Step 2: Create packages/config**

`templates/monorepo/packages/config/package.json`:
```json
{
  "name": "@repo/config",
  "version": "0.0.1",
  "private": true
}
```

`templates/monorepo/packages/config/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Add @repo/types as a dependency of apps/api and apps/web**

Modify `templates/monorepo/apps/api/package.json` `dependencies` — add:
```json
"@repo/types": "workspace:*"
```

Modify `templates/monorepo/apps/web/package.json` `dependencies` — add:
```json
"@repo/types": "workspace:*"
```

- [ ] **Step 4: Commit**

```bash
git add templates/monorepo/packages templates/monorepo/apps/api/package.json templates/monorepo/apps/web/package.json
git commit -m "feat(monorepo-template): add packages/types and packages/config"
```

---

## Task 15: Monorepo — turbo.json pipelines + root scripts

**Files:**
- Modify: `templates/monorepo/turbo.json`
- Modify: `templates/monorepo/package.json`

- [ ] **Step 1: Add test pipeline to turbo.json**

`templates/monorepo/turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 2: Add root test script**

`templates/monorepo/package.json`:
```json
{
  "name": "my-monorepo",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: Commit**

```bash
git add templates/monorepo/turbo.json templates/monorepo/package.json
git commit -m "feat(monorepo-template): add test pipeline to turbo and root scripts"
```

---

## Task 16: Monorepo — integration validation

**Files:** none (validation only)

- [ ] **Step 1: Build the CLI**
```bash
npm run build
```

- [ ] **Step 2: Scaffold a monorepo project into a temp dir**
```bash
mkdir -p /tmp/cgcheck3 && cd /tmp/cgcheck3 && echo n | node "$OLDPWD/dist/index.js" mono-check --monorepo
```

- [ ] **Step 3: Install with pnpm and run pipelines**
```bash
cd /tmp/cgcheck3/mono-check && pnpm install && pnpm test && pnpm lint
```
Expected: `apps/api` Jest unit + e2e pass (via its own `test` script — note root `turbo test` only runs `test`, not `test:e2e`; if e2e should also run in CI-equivalent, that's a follow-up, not in scope here), `apps/web` Vitest passes, both lint clean.

- [ ] **Step 4: Verify API health endpoint manually**
```bash
cd apps/api && pnpm dev &
sleep 3
curl http://localhost:3000/api/health
kill %1
```
Expected: `{"status":"ok"}`.

- [ ] **Step 5: Clean up**
```bash
cd "$OLDPWD" && rm -rf /tmp/cgcheck3
```

---

## Task 17: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a "Scripts disponíveis" section to README.md**

Insert after the `## Templates` table (before `## Desenvolvimento local`) in `README.md`:
```markdown
## Scripts disponíveis nos projetos gerados

Todo template criado já vem com testes e lint configurados:

| Script | O que faz |
|--------|-----------|
| `npm run test` | Roda os testes (Jest no `--ddd`, Vitest no `--react`) |
| `npm run lint` | Roda o ESLint |
| `npm run format` | Formata o código com Prettier |

No `--ddd`, também tem `npm run test:e2e` pros testes end-to-end.

No `--monorepo`, usa `pnpm test` / `pnpm lint` na raiz pra rodar em todos os workspaces de uma vez (via Turborepo).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document test/lint/format scripts in templates"
```

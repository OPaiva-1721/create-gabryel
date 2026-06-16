



# create-gabryel

CLI para criar projetos do jeito certo. Feita por Gabryel Paiva Neves.

## Uso

```bash
# Modo interativo
npm create gabryel@latest

# Com flags (pula prompts)
npm create gabryel@latest meu-projeto --ddd
npm create gabryel@latest meu-projeto --react
npm create gabryel@latest meu-projeto --monorepo
```

## Templates

| Flag | Stack |
|------|-------|
| `--ddd` | NestJS + DDD + Drizzle ORM + Fastify |
| `--react` | React 19 + Vite + TypeScript + path aliases |
| `--monorepo` | Turborepo + pnpm workspaces (api + web) |

## Scripts disponíveis nos projetos gerados

Todo template criado já vem com testes e lint configurados:

| Script | O que faz |
|--------|-----------|
| `npm run test` | Roda os testes (Jest no `--ddd`, Vitest no `--react`) |
| `npm run lint` | Roda o ESLint |
| `npm run format` | Formata o código com Prettier |

No `--ddd`, também tem `npm run test:e2e` pros testes end-to-end.

No `--monorepo`, usa `pnpm test` / `pnpm lint` na raiz pra rodar em todos os workspaces de uma vez (via Turborepo).

## Desenvolvimento local

```bash
pnpm install
pnpm build

# Testar localmente
node dist/index.js meu-projeto --ddd
```

## Publicar no npm

```bash
npm login
npm publish --access public
```

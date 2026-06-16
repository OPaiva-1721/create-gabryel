



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

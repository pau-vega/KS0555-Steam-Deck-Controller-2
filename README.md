# Monorepo Template

A TypeScript monorepo powered by pnpm workspaces and Turborepo.

## Structure

```
apps/
  showcase/       — Vite + React demo app (Tailwind, shadcn, Playwright e2e)
packages/
  ui/             — Shared component library (tsup, shadcn)
  eslint-config/  — Shared ESLint configuration
  tsconfig/       — Shared TypeScript configuration
```

## Prerequisites

- Node.js >= 24
- pnpm 10

## Getting started

```bash
# Install dependencies
pnpm install

# Start all apps/packages in dev mode
pnpm dev

# Build everything
pnpm build
```

## Available scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start dev servers                  |
| `pnpm build`         | Build all packages and apps        |
| `pnpm lint`          | Lint all packages                  |
| `pnpm format`        | Format all files with Prettier     |
| `pnpm typecheck`     | Run TypeScript type checking       |
| `pnpm test`          | Run unit tests (Vitest)            |
| `pnpm e2e`           | Run end-to-end tests (Playwright)  |
| `pnpm test:coverage` | Run tests with coverage            |
| `pnpm clean`         | Remove build artifacts             |

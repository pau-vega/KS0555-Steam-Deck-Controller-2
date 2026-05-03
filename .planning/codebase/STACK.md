# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**
- TypeScript 5.9.3 - Used across all packages and applications for type-safe development
- JavaScript - Used in config files and build tooling

**Secondary:**
- JSX/TSX - React component syntax used in UI package and showcase app

## Runtime

**Environment:**
- Node.js 24+ (specified in `package.json` engines field and `.nvmrc`)

**Package Manager:**
- pnpm 10.29.3
- Lockfile: `pnpm-lock.yaml` (enforced with `preferFrozenLockfile: true`)

## Frameworks

**Core:**
- React 19.2.5 - UI library for building components
- React DOM 19.2.5 - React rendering for web
- Base UI React 1.4.0 - Headless component library for accessible UI components

**Styling:**
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind CSS integration
- @tailwindcss/postcss - PostCSS plugin for Tailwind CSS compilation
- PostCSS - CSS transformation tool (via postcss.config.mjs in UI package)

**Build/Development:**
- Vite 8.0.8 - Fast build tool and dev server
- Turbo 2.9.6 - Monorepo task orchestration
- tsup 8.5.1 - TypeScript bundler (used for UI package and eslint-config)
- Playwright 1.59.1 - E2E testing framework (showcase app)

**Testing:**
- Vitest 4.1.4 - Vite-native unit test framework
- @vitest/coverage-v8 4.1.4 - V8-based coverage provider

**Linting & Formatting:**
- ESLint 10.2.0 - JavaScript linting with flat config support
- Prettier 3.8.2 - Code formatter
- typescript-eslint 8.58.2 - TypeScript support for ESLint
- @eslint-react/eslint-plugin 4.2.3 - React-specific ESLint rules
- eslint-plugin-perfectionist 5.8.0 - Sorting plugins for consistency
- eslint-plugin-react-hooks 7.0.1 - React Hooks linting rules
- eslint-config-prettier 10.1.8 - Disables conflicting ESLint rules
- eslint-plugin-prettier 5.5.5 - Prettier integration for ESLint

**UI Components & Libraries:**
- shadcn 4.2.0 - Component library CLI tool for adding pre-built components
- class-variance-authority 0.7.1 - Type-safe component variant creation
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Merge Tailwind CSS classes intelligently
- lucide-react 1.8.0 - Icon library
- cmdk 1.1.1 - Command menu component
- date-fns 4.1.0 - Date manipulation library
- react-day-picker 9.14.0 - Calendar component
- embla-carousel-react 8.6.0 - Carousel component library
- input-otp 1.4.2 - OTP input component
- react-resizable-panels 4.10.0 - Resizable panel library
- recharts 3.8.0 - React charting library
- sonner 2.0.7 - Toast notification library
- vaul 1.1.2 - Drawer component library
- next-themes 0.4.6 - Theme switching utility
- tw-animate-css 1.4.0 - Tailwind animation utilities
- @fontsource-variable/inter 5.2.8 - Inter variable font

**Testing Libraries:**
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - Custom Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User event simulation for testing
- jsdom 29.0.2 - JavaScript implementation of web standards for testing

**Utilities:**
- rimraf 6.1.3 - Cross-platform file deletion utility
- glob 13.0.6 - File pattern matching (used in tsup config)
- globals 17.5.0 - Global object/variable definitions for linting

**Git Hooks:**
- husky 9.1.7 - Git hooks manager
- @commitlint/cli 20.5.0 - Commit message linting
- @commitlint/config-conventional 20.5.0 - Conventional commits config

## Configuration

**Environment:**
- No `.env` files detected - This is a template/showcase project with no external dependencies requiring secrets
- Configuration primarily through `tsconfig.base.json` with esnext target and bundler module resolution

**Build:**
- Turbo configuration: `turbo.json` - Defines task dependencies, caching, and inputs/outputs
- TypeScript: `tsconfig.base.json` - Base config with strict mode, module detection, noUncheckedIndexedAccess enabled
- Prettier: `.prettierrc` - Semi-colon disabled, 120 character print width
- PostCSS: `packages/ui/postcss.config.mjs` - Loads Tailwind CSS PostCSS plugin

**Monorepo:**
- pnpm workspaces: `pnpm-workspace.yaml` - Defines workspace packages in `apps/*` and `packages/*`
- Catalog dependencies: All testing, type, and tooling packages use pnpm catalog for version management
- Dedupe enabled: `dedupePeerDependents: true`

## Platform Requirements

**Development:**
- Node.js >= 24
- pnpm 10.29.3
- System supporting Node.js v24

**Production:**
- No backend/server infrastructure required - This is a frontend component library and showcase application
- Deployment target: Static site hosting (compatible with any static host via Vite output)

## Workspace Structure

**Packages:**
- `packages/ui` - React component library with export subpaths for components, hooks, CSS, and utilities
- `packages/tsconfig` - Shared TypeScript configuration with base config extending @tsconfig/node24
- `packages/eslint-config` - Shared ESLint and Prettier configuration with node and react presets

**Applications:**
- `apps/showcase` - Vite + React showcase application demonstrating UI components, includes E2E tests with Playwright

---

*Stack analysis: 2026-04-14*

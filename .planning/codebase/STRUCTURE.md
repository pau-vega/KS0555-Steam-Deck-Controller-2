# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```
/Users/pauvelascogarrofe/Documents/base-monorepo-template/
├── apps/                           # End-user applications
│   └── showcase/                   # Interactive UI component showcase
│       ├── src/
│       │   ├── components/         # Showcase-specific components
│       │   │   ├── categories/     # Component category pages
│       │   │   ├── component-example.tsx  # Main tabbed interface
│       │   │   └── example.tsx     # Example component wrapper
│       │   ├── assets/             # Static assets
│       │   ├── app.tsx             # Root component
│       │   ├── main.tsx            # React entry point
│       │   ├── index.css           # App styles
│       │   ├── vite.config.ts      # Vite configuration
│       │   └── vitest.config.ts    # Test runner configuration
│       ├── package.json            # App dependencies
│       └── tsconfig.json           # TypeScript config with path aliases
├── packages/                       # Shared libraries and configurations
│   ├── ui/                         # Primary UI component library
│   │   ├── src/
│   │   │   ├── components/         # 50+ reusable React components
│   │   │   │   ├── __tests__/      # Component unit tests
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── ... (50+ components)
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   └── use-mobile.ts   # Responsive design hook
│   │   │   ├── lib/                # Utility functions
│   │   │   │   ├── __tests__/
│   │   │   │   └── utils.ts        # cn() class merge utility
│   │   │   ├── styles/             # Global CSS
│   │   │   │   └── globals.css     # Tailwind reset and custom properties
│   │   │   ├── test/               # Test setup and fixtures
│   │   │   │   └── setup.ts        # Vitest environment setup
│   │   │   ├── index.ts            # Barrel export (all public APIs)
│   │   │   └── env.d.ts            # TypeScript ambient declarations
│   │   ├── package.json            # Library metadata and exports
│   │   ├── tsconfig.json           # Component library TypeScript config
│   │   ├── vitest.config.ts        # Component test configuration
│   │   └── tsup.config.ts          # Build configuration (if exists)
│   ├── tsconfig/                   # Shared TypeScript configurations
│   │   ├── base.json               # Base TS config for all packages
│   │   ├── react-app.json          # App-specific TS config
│   │   ├── react-library.json      # Library-specific TS config
│   │   └── package.json            # Config package metadata
│   └── eslint-config/              # Shared ESLint configurations
│       ├── eslint.config.ts        # Flat ESLint config (v9+)
│       └── package.json            # Config package metadata
├── tsconfig.base.json              # Root TypeScript base configuration
├── turbo.json                       # Turbo pipeline and task configuration
├── package.json                    # Root workspace configuration
├── pnpm-workspace.yaml             # pnpm workspace definition (if exists)
├── prettier.config.*               # Prettier formatting rules (if exists)
├── .prettierrc                      # Prettier config (if exists)
├── .planning/
│   └── codebase/                   # Architecture analysis documents
│       ├── ARCHITECTURE.md         # Architecture patterns and layers
│       ├── STRUCTURE.md            # This file - directory and file mapping
│       ├── CONVENTIONS.md          # Coding standards and patterns
│       ├── TESTING.md              # Testing frameworks and patterns
│       ├── STACK.md                # Technology stack
│       ├── INTEGRATIONS.md         # External services and APIs
│       └── CONCERNS.md             # Technical debt and issues
├── .claude/                        # GSD orchestration metadata
├── .git/                           # Git repository
├── .github/                        # GitHub workflows and templates
└── .husky/                         # Git hooks configuration
```

## Directory Purposes

**apps/showcase:**
- Purpose: Interactive web application demonstrating all UI components in categories
- Contains: React app entry, category example pages, test files, Vite config
- Key files: `src/main.tsx` (bootstrap), `src/app.tsx` (root), `src/components/component-example.tsx` (main UI)

**packages/ui:**
- Purpose: Published component library consumed by apps and external projects
- Contains: 50+ components, hooks, utilities, styles, tests
- Key structure: Each component = single `.tsx` file with named exports

**packages/ui/src/components:**
- Purpose: Reusable UI component implementations
- Contains: One file per component (e.g., `button.tsx`, `dialog.tsx`)
- Pattern: Each file exports multiple named exports for sub-components (e.g., `Button`, `ButtonGroup`)

**packages/ui/src/hooks:**
- Purpose: Custom React hooks for shared logic
- Contains: `use-mobile.ts` and others for responsive/stateful patterns
- Usage: Imported by components or showcase app

**packages/ui/src/lib:**
- Purpose: Utility functions and helpers
- Contains: `utils.ts` with `cn()` class merge function
- Usage: Imported by all components for safe Tailwind class merging

**packages/ui/src/styles:**
- Purpose: Global styles and CSS variables
- Contains: `globals.css` with Tailwind reset and theme variables
- Usage: Imported once in app entry point (`apps/showcase/src/main.tsx`)

**packages/ui/src/test:**
- Purpose: Shared test infrastructure
- Contains: `setup.ts` configures Vitest environment (@testing-library/jest-dom)
- Usage: Referenced in `vitest.config.ts` via `setupFiles`

**packages/tsconfig:**
- Purpose: Centralized TypeScript configurations for all workspaces
- Contains: Base config + app/library-specific variants
- Usage: Extended via `extends` field in workspace tsconfigs

**packages/eslint-config:**
- Purpose: Centralized ESLint and Prettier rules for all workspaces
- Contains: Flat ESLint config (v9+), prettier rules, React rules
- Usage: Imported in workspace `eslint.config.ts` files as `...react`

## Key File Locations

**Entry Points:**
- `apps/showcase/src/main.tsx` - React DOM bootstrap (createRoot, render)
- `apps/showcase/src/app.tsx` - Root component returning ComponentExample
- `packages/ui/src/index.ts` - Library barrel export for all components/hooks/utils

**Configuration:**
- `tsconfig.base.json` - Root TypeScript config inherited by all packages
- `packages/tsconfig/*.json` - Specific configs for apps vs libraries
- `turbo.json` - Build orchestration, task dependencies, caching rules
- `apps/showcase/vite.config.ts` - Development server and build config
- `apps/showcase/vitest.config.ts` - Component test runner setup
- `packages/ui/vitest.config.ts` - Library test configuration

**Core Logic:**
- `packages/ui/src/components/*.tsx` - Individual component implementations (50+)
- `packages/ui/src/lib/utils.ts` - Shared `cn()` utility for class merging
- `packages/ui/src/hooks/use-mobile.ts` - Responsive design helper
- `apps/showcase/src/components/component-example.tsx` - Main showcase interface
- `apps/showcase/src/components/categories/*.tsx` - Component example groups (6 categories)

**Testing:**
- `packages/ui/src/components/__tests__/button.test.tsx` - Component unit test example
- `packages/ui/src/lib/__tests__/utils.test.ts` - Utility function tests
- `packages/ui/src/test/setup.ts` - Test environment configuration
- `vitest.config.ts` (root) - Root test configuration

## Naming Conventions

**Files:**
- Components: kebab-case (e.g., `button.tsx`, `alert-dialog.tsx`)
- Test files: Same name + `.test.tsx` or `.spec.ts` (e.g., `button.test.tsx`)
- Config files: kebab-case with extensions (e.g., `vite.config.ts`)
- Utilities: camelCase (e.g., `utils.ts`)
- Hooks: camelCase with `use` prefix (e.g., `use-mobile.ts`)

**Directories:**
- Features/components: kebab-case (e.g., `component-example`, `button-group`)
- Structural: lowercase plural (e.g., `components`, `packages`, `apps`, `hooks`, `styles`)
- Test directories: `__tests__` (double underscore convention)

**Exports:**
- Components: PascalCase (e.g., `Button`, `AccordionItem`, `DialogTrigger`)
- Hooks: camelCase with `use` prefix (e.g., `useIsMobile`)
- Utilities: camelCase (e.g., `cn`)
- Constants: ALL_CAPS (not observed in provided files)

## Where to Add New Code

**New Component:**
- Primary file: `packages/ui/src/components/my-component.tsx`
- Test file: `packages/ui/src/components/__tests__/my-component.test.tsx`
- Steps:
  1. Create component wrapping `@base-ui/react` primitive with CVA styling
  2. Define variant CVA at top of file
  3. Create component function(s) with typed props
  4. Export all sub-components at bottom (named exports only)
  5. Add test file in `__tests__` directory
  6. Update `packages/ui/src/index.ts` to re-export new component
  7. Add showcase examples in `apps/showcase/src/components/categories/` appropriate category

**New Hook:**
- File: `packages/ui/src/hooks/use-my-hook.ts`
- Pattern: Named export, camelCase `use` prefix, documented behavior
- Steps:
  1. Create hook file in `hooks/` directory
  2. Use React hooks internally (useState, useEffect, etc.)
  3. Export function (named export)
  4. Add test in `hooks/__tests__/` if complex
  5. Update `packages/ui/src/index.ts` to re-export hook

**New Utility:**
- File: `packages/ui/src/lib/my-utils.ts` or extend `packages/ui/src/lib/utils.ts`
- Pattern: Named exports for individual functions
- Steps:
  1. Add function to `lib/utils.ts` or create new file
  2. Include JSDoc comments if behavior is non-obvious
  3. Add test in `lib/__tests__/`
  4. Export from `packages/ui/src/index.ts` if public API

**New Showcase Category:**
- Primary file: `apps/showcase/src/components/categories/my-category.tsx`
- Steps:
  1. Create category file in `categories/` directory
  2. Export function component named `MyCategoryExamples`
  3. Import UI components from `@monorepo-template/ui`
  4. Render component examples with typical use cases
  5. Add TabsTrigger in `apps/showcase/src/components/component-example.tsx`
  6. Add TabsContent section with category examples

**New Package:**
- Create: `packages/my-package/`
- Steps:
  1. Create `package.json` with `workspace:*` dependencies for shared configs
  2. Create `src/index.ts` as entry point
  3. Create `tsconfig.json` extending `@monorepo-template/tsconfig/react-library.json`
  4. Create `eslint.config.ts` importing from `@monorepo-template/eslint-config`
  5. pnpm automatically detects workspace via directory structure

## Special Directories

**node_modules:**
- Purpose: Installed dependencies (pnpm)
- Generated: Yes (by pnpm install)
- Committed: No (.gitignore)
- Note: Uses pnpm's flat + hoisted structure; always regenerate

**.turbo:**
- Purpose: Turbo build cache
- Generated: Yes (during build)
- Committed: No
- Note: Remote cache can be enabled via `remoteCache` in turbo.json

**dist/ (per package):**
- Purpose: Compiled output (TypeScript -> JavaScript, CSS)
- Generated: Yes (by build tools: tsup, Vite, tsc)
- Committed: No (.gitignore)
- Pattern: `pnpm clean` removes all dist folders via turbo

**.planning/codebase:**
- Purpose: Architecture and analysis documents
- Generated: No (manually created by architect)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.

**.claude/:**
- Purpose: GSD orchestration metadata for Claude Code agent
- Generated: By GSD system
- Committed: No (workspace state)
- Contents: Commands, hooks, agent definitions

**.git/**
- Purpose: Version control
- Generated: Yes (git init)
- Committed: No (gitignore)

---

*Structure analysis: 2026-04-14*

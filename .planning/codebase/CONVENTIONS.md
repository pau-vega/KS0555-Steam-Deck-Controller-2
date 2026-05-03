# Coding Conventions

**Analysis Date:** 2026-04-14

## Naming Patterns

**Files:**
- kebab-case for all files: `button-group.tsx`, `utils.test.ts`, `eslint.config.ts`
- Component files use `.tsx` extension
- Test files use `.test.ts` or `.spec.ts` suffix

**Functions:**
- camelCase for all functions: `mergeProps()`, `useRender()`, `cn()`
- React components use PascalCase: `ButtonGroup`, `Tabs`, `Card`

**Variables:**
- camelCase for all variable declarations: `buttonGroupVariants`, `className`, `orientation`
- Exported constants use camelCase: `node` (ESLint config), `react` (ESLint config)

**Types & Interfaces:**
- PascalCase for all types: `VariantProps`, `ComponentProps`
- Import types using `import type` syntax: `import type { VariantProps } from "class-variance-authority"`
- Generic type parameters prefixed with `T`: `TItem` (though rarely used in this codebase)

## Code Style

**Formatting:**
- Prettier with configuration: `{ "semi": false, "printWidth": 120 }`
- No semicolons at end of statements
- 120 character line width
- Config file: `.prettierrc`

**Linting:**
- ESLint with flat config (v9+)
- Separate configs for Node and React:
  - `packages/eslint-config/src/node.ts` — for Node.js files
  - `packages/eslint-config/src/react.ts` — for React files
- Config files: `eslint.config.ts` (not `.eslintrc.json`)

**ESLint Rules:**
- `@typescript-eslint/consistent-type-imports`: error — enforces `import type` for type-only imports
- `perfectionist/sort-imports`: error — alphabetically sorts imports
- `prettier/prettier`: warn — integration with Prettier
- React-specific rules:
  - `@eslint-react/*` plugin recommendations
  - `react-hooks` plugin for hooks rules
  - `react-refresh` for Fast Refresh support

## Import Organization

**Order:**
1. Third-party library imports (e.g., `import { describe, expect, it } from "vitest"`)
2. Type-only imports from third-party libraries: `import type { VariantProps } from "class-variance-authority"`
3. Relative imports from internal modules
4. Type-only imports from internal modules: `import type { User } from "./user"`

**Path Aliases:**
- `@ui` — maps to `packages/ui/src` (used in tests)
- `@monorepo-template/ui` — package export name (used in apps)
- `@` — maps to `src` root in app projects (e.g., `@/components/example`)

**Example (from `packages/ui/src/components/button-group.tsx`):**
```typescript
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { Separator } from "@ui/components/separator"
import { cn } from "@ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
```

## Error Handling

**Patterns:**
- No explicit try-catch patterns found in codebase
- Functions do not use Result types
- Components assume props are valid; no runtime validation
- React components rely on TypeScript for type safety

## Logging

**Framework:** console (no dedicated logging library detected)

**Patterns:**
- No logging calls found in component code
- Logging reserved for development/debugging only

## Comments

**When to Comment:**
- JSDoc comments for complex Playwright test suites (describe blocks)
- Comments explaining configuration choices (e.g., `export default defineConfig` comment in `playwright.config.ts`)
- Minimal inline comments — code is expected to be self-documenting

**JSDoc/TSDoc:**
- Rarely used — code clarity prioritized over inline documentation
- Example from `playwright.config.ts`:
  ```typescript
  /**
   * Playwright config for the showcase app.
   * `export default` is required by Playwright (framework exception).
   */
  ```

## Function Design

**Size:** 
- Prefer smaller, focused functions
- Components typically 10-50 lines (including JSX)
- Utility functions very concise (e.g., `cn()` is 3 lines)

**Parameters:**
- Accept React.ComponentProps spreads for flexibility: `React.ComponentProps<"div">`, `TabsPrimitive.List.Props`
- Use destructuring with rest operator: `{ className, orientation, ...props }`
- Props grouped at end of parameters: `...props`

**Return Values:**
- JSX components return single JSX element
- Utility functions return typed values: `cn()` returns `string`
- No explicit return type annotations on React components

## Module Design

**Exports:**
- Named exports only (no default exports per project guidelines)
- Multiple related functions exported together: `export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }`
- Path aliases used for clean imports

**Barrel Files:**
- Index files re-export from components: `export { Button } from "./button"`
- Allows `import { Button } from "@monorepo-template/ui/components/button"`

**Component Structure Pattern:**
```typescript
// Define variant styles with CVA
const buttonGroupVariants = cva(...)

// Main component
function ButtonGroup({ className, orientation, ...props }) { ... }

// Sub-component variants
function ButtonGroupText({ className, render, ...props }) { ... }
function ButtonGroupSeparator({ className, orientation, ...props }) { ... }

// Export all related
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
```

## Type Patterns

**Discriminated Unions:**
- Not heavily used in this codebase
- Test suites use clear, single-responsibility functions

**Optional Properties:**
- Prefer `prop?: Type` over `prop: Type | undefined`
- Example: `className?: string`, `orientation?: "horizontal" | "vertical"`

**Class Variance Authority (CVA):**
- Used extensively for component variants
- Pattern: `const variantName = cva("base classes", { variants: { ... } })`
- Variant props destructured from `VariantProps<typeof variantName>`

---

*Convention analysis: 2026-04-14*

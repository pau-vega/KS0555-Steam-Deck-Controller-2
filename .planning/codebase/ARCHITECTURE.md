# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Monorepo with component library + showcase application using Turbo for orchestration.

**Key Characteristics:**
- Workspace-based monorepo (pnpm) with two main workspaces: `/apps` and `/packages`
- Centralized UI component library (`@monorepo-template/ui`) providing reusable React components
- Showcase application (`apps/showcase`) demonstrates all UI components
- Build pipeline orchestrated through Turbo with task dependencies and caching
- Strict TypeScript with `noUncheckedIndexedAccess` enabled across all packages
- Component styling via Tailwind CSS + CVA (Class Variance Authority) for variants

## Layers

**Monorepo Root:**
- Purpose: Orchestrate builds, linting, and testing across all workspaces
- Location: `/Users/pauvelascogarrofe/Documents/base-monorepo-template`
- Contains: Root `package.json`, Turbo configuration, TypeScript base config, shared tooling
- Depends on: pnpm workspaces, Turbo, shared dev dependencies
- Used by: All workspace packages through npm/pnpm resolution

**Packages Layer:**
- Purpose: Shared, reusable code and configurations
- Location: `/packages`
- Contains: UI component library, ESLint config, TypeScript configs
- Depends on: React, Tailwind CSS, @base-ui/react
- Used by: Apps and other packages via workspace dependencies

**UI Component Library (`@monorepo-template/ui`):**
- Purpose: Centralized collection of accessible React UI components
- Location: `/packages/ui/src`
- Contains: 50+ components, custom hooks, utility functions
- Depends on: @base-ui/react (headless components), class-variance-authority, clsx, tailwind-merge
- Used by: `apps/showcase` and external consumers via npm exports

**Apps Layer:**
- Purpose: End-user applications that consume packages
- Location: `/apps`
- Contains: Showcase application
- Depends on: @monorepo-template/ui, React, Vite, Tailwind CSS
- Used by: End users and developers

**Showcase Application (`apps/showcase`):**
- Purpose: Interactive demonstration and testing environment for all UI components
- Location: `/apps/showcase/src`
- Contains: Component category pages, example compositions, Vite/React entry points
- Depends on: @monorepo-template/ui, @base-ui/react, Vite, Playwright (E2E)
- Used by: Developers, designers, and QA for component validation

## Data Flow

**Component Export Flow:**

1. Components defined in `/packages/ui/src/components/` (e.g., `button.tsx`)
2. Each component wraps a `@base-ui/react` primitive with styling via CVA + Tailwind
3. Index file `/packages/ui/src/index.ts` re-exports all components via barrel exports
4. Build process (`tsup`) compiles TypeScript to `dist/` with proper export mappings
5. Showcase imports components from published exports (e.g., `@monorepo-template/ui/components/button`)

**Build Pipeline Flow:**

1. Root `turbo dev` triggers parallel `pnpm dev` in each workspace
2. Root `turbo build` respects task dependencies: `build` depends on `^build` (dependencies first)
3. tsconfig references propagate from root to packages via extends mechanism
4. Build outputs cached in `.turbo/` and remote cache (enabled in turbo.json)

**Example: Button Component Execution:**

1. User clicks `<Button>` in showcase (`apps/showcase/src/components/forms.tsx`)
2. Button component from `@monorepo-template/ui/components/button` renders
3. Component renders ButtonPrimitive from `@base-ui/react/button` with:
   - CVA-generated class string based on `variant` and `size` props
   - Tailwind classes for styling
   - SVG icons from lucide-react for visual feedback
4. Click event propagates to React handler (example in category files)

**State Management:**

- No centralized state management; components are presentational
- Props passed down from showcase category files to component instances
- Each component fully controlled by parent (showcase category pages)
- Test examples use `useCallback`, `useState` for demonstration

## Key Abstractions

**Component Pattern:**

- Purpose: Styled wrapper around headless primitives from @base-ui/react
- Examples: `packages/ui/src/components/button.tsx`, `packages/ui/src/components/accordion.tsx`
- Pattern: Named exports of sub-components (e.g., `Button`, `ButtonGroup` with multiple exports)
- Implementation example (Button):
  ```tsx
  function Button({ className, ...props }) {
    return <ButtonPrimitive className={cn(buttonVariants({ variant, size }), className)} {...props} />
  }
  export { Button }
  ```

**Variant Definition via CVA:**

- Purpose: Type-safe, maintainable component variants
- Examples: `buttonVariants` in `packages/ui/src/components/button.tsx`
- Pattern: `cva()` defines base classes and variant combinations
- Extracts variant and size from props, generates optimized Tailwind classes

**Utility Functions:**

- Purpose: Shared helper functions across components
- Location: `packages/ui/src/lib/utils.ts`
- Key function: `cn()` merges class names with Tailwind deduplication
- Pattern: Wraps `clsx` + `tailwind-merge` for safe class composition

**Custom Hooks:**

- Purpose: Reusable React logic
- Location: `packages/ui/src/hooks/`
- Key hook: `useIsMobile()` - detects viewport size via media query
- Pattern: Returns boolean state synced with window resize/media query changes

**Barrel Exports:**

- Purpose: Cleaner imports and API surface
- Location: `packages/ui/src/index.ts`
- Pattern: Re-exports all components and utilities in one file
- Allows: `import { Button } from '@monorepo-template/ui'`

## Entry Points

**Root Development:**
- Location: `turbo.json`
- Triggers: `pnpm dev` spawns Vite + watch processes for each workspace
- Responsibilities: Coordinate workspace development builds

**Showcase App Entry:**
- Location: `apps/showcase/src/main.tsx`
- Triggers: Vite bundler creates development server on dev command
- Responsibilities: Initialize React app, render App component with StrictMode
- Code: Imports global styles, mounts App to DOM

**Showcase Root Component:**
- Location: `apps/showcase/src/app.tsx`
- Triggers: Called from main.tsx
- Responsibilities: Render ComponentExample (the showcase page)
- Code: Single-line component returning ComponentExample instance

**Component Example Component:**
- Location: `apps/showcase/src/components/component-example.tsx`
- Triggers: Called from App
- Responsibilities: Render tabbed interface with 6 component category sections
- Pattern: Tabs control which category examples display; each category is imported separately

**UI Package Entry:**
- Location: `packages/ui/src/index.ts`
- Triggers: Build process exports this as library entry point
- Responsibilities: Re-export all public components, hooks, utilities
- Exports handled through `exports` field in `packages/ui/package.json` with subpath exports

## Error Handling

**Strategy:** Framework-level error boundaries not explicitly configured; relies on React StrictMode for dev warnings.

**Patterns:**

- Test files use `expect()` assertions from Vitest to validate expected behavior
- Components assume valid props; no runtime validation (TypeScript provides compile-time safety)
- Event handlers wrapped in async `userEvent.setup()` during testing for proper async handling

## Cross-Cutting Concerns

**Logging:** Not explicitly configured; relies on browser console for development debugging.

**Validation:** TypeScript type system enforces prop types at compile time; `noUncheckedIndexedAccess` prevents unsafe array/object access.

**Authentication:** Not applicable; components are presentational UI with no auth logic.

**Styling:** Centralized Tailwind CSS configuration in `/apps/showcase` and `/packages/ui` via:
- `tailwind.config.ts` (if present) or inherited from Tailwind defaults
- CSS reset and custom variables in `packages/ui/src/styles/globals.css`
- Component-level utility: `cn()` function for safe class merging

**Testing:** Vitest with jsdom environment provides React component testing across workspaces.

---

*Architecture analysis: 2026-04-14*

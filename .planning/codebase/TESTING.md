# Testing Patterns

**Analysis Date:** 2026-04-14

## Test Framework

**Runner:**
- Vitest (latest version)
- Config: `vitest.config.ts` at monorepo root and per-package
- Environment: jsdom (for React component tests)

**Assertion Library:**
- Vitest built-in `expect` API

**Run Commands:**
```bash
pnpm test              # Run all tests once (turbo orchestrated)
pnpm test:watch        # Watch mode for packages/ui
pnpm test:coverage     # Run tests with coverage reporting
pnpm e2e               # Run Playwright E2E tests (apps/showcase only)
pnpm e2e:ui            # Playwright tests with UI
pnpm e2e:report        # Show Playwright HTML report
```

## Test File Organization

**Location:**
- Co-located with source code in `__tests__` subdirectory
- Example: `packages/ui/src/lib/__tests__/utils.test.ts`
- E2E tests in separate `e2e/` directory at app root: `apps/showcase/e2e/`

**Naming:**
- Unit/integration tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts` (Playwright convention)

**Structure:**
```
packages/ui/src/
├── lib/
│   ├── __tests__/
│   │   └── utils.test.ts
│   └── utils.ts
└── components/
    ├── button.tsx
    └── (no tests found — components use shadow DOM patterns from @base-ui/react)

apps/showcase/
├── e2e/
│   └── showcase.spec.ts
└── src/
    └── (integration tested via E2E)
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest"

import { cn } from "../utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })
  it("handles undefined/null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })
  it("handles conditional classes", () => {
    expect(cn("base", { active: true, inactive: false })).toBe("base active")
  })
  it("deduplicates Tailwind via tailwind-merge", () => {
    expect(cn("p-4", "p-8")).toBe("p-8")
  })
  it("returns empty string for no input", () => {
    expect(cn()).toBe("")
  })
})
```

**Patterns:**
- Top-level imports: `import { describe, expect, it } from "vitest"`
- Group related tests in `describe()` blocks
- Use clear, descriptive test names: `"merges class names"`, `"handles undefined/null"`
- One assertion per test case (mostly)
- Import the code being tested first (top of file)

## E2E Test Structure (Playwright)

**Suite Organization:**
```typescript
import { expect, test } from "@playwright/test"

test.describe("Showcase app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.describe("Smoke tests", () => {
    test("loads with tab bar showing all 6 tabs", async ({ page }) => {
      const tabs = ["Forms", "Overlays", "Navigation", "Feedback", "Data Display", "Layout"]
      for (const tab of tabs) {
        await expect(page.getByRole("tab", { name: tab })).toBeVisible()
      }
    })
  })

  test.describe("Interactive flows", () => {
    test("Dialog opens and closes", async ({ page }) => {
      await page.getByRole("tab", { name: "Overlays" }).click()
      await page.getByRole("button", { name: "Open Dialog" }).click()
      await expect(page.getByRole("heading", { name: "Edit profile" })).toBeVisible()
      await page.getByRole("button", { name: "Close" }).first().click()
      await expect(page.getByRole("heading", { name: "Edit profile" })).toBeHidden()
    })
  })
})
```

**Patterns:**
- `test.describe()` for nested test groups
- `test.beforeEach()` for setup (navigate to page)
- Accessibility-first selectors: `getByRole()`, `getByText()`
- Clear test names describing user interactions: `"Dialog opens and closes"`, `"Tab navigation"`
- Await all async operations explicitly

## Mocking

**Framework:** Not heavily used in this codebase

**What to Mock:**
- External API calls (not present in unit tests)
- File system operations (not present)

**What NOT to Mock:**
- DOM/React components (test real behavior)
- Utilities like `cn()` (test actual output)
- @base-ui/react components (use real implementations)

## Fixtures and Factories

**Test Data:**
- No factory functions found
- Utilities tested with inline literals: `cn("foo", "bar")`, `cn("p-4", "p-8")`
- E2E tests use hardcoded tab names and selectors

**Location:**
- Inline in test files
- No shared fixtures or factories directory

## Coverage

**Requirements:** Not enforced at monorepo level

**View Coverage:**
```bash
pnpm test:coverage      # Runs turbo test -- --coverage
```

**Configuration (packages/ui/vitest.config.ts):**
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.d.ts", "**/*.config.*"],
}
```

## Test Types

**Unit Tests:**
- Scope: Individual utility functions (`cn()`)
- Approach: Pure functions tested with direct input/output
- File: `packages/ui/src/lib/__tests__/utils.test.ts`
- Coverage: Basic happy path and edge cases (undefined, null, empty)

**Integration Tests:**
- Scope: None explicitly — E2E tests cover full integration
- Approach: N/A

**E2E Tests:**
- Framework: Playwright (v1+)
- Scope: Full application workflows from user perspective
- File: `apps/showcase/e2e/showcase.spec.ts`
- Coverage:
  - Smoke tests (page loads, tabs render)
  - Navigation flows (tab switching)
  - Interactive flows (dialog open/close, accordion expand/collapse)
  - User interactions (clicking, visibility checks)

## Playwright Configuration

**Config File:** `apps/showcase/playwright.config.ts`

**Key Settings:**
```typescript
{
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,        // Fail on focused tests in CI
  retries: process.env.CI ? 2 : 0,     // 2 retries in CI, 0 locally
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:5173",  // Vite default dev server
    trace: "on-first-retry",           // Debug failed tests
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "pnpm dev",               // Start dev server
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  }
}
```

## Common Patterns

**Async Testing:**
```typescript
// Playwright — async test with await
test("Dialog opens and closes", async ({ page }) => {
  await page.getByRole("button", { name: "Open Dialog" }).click()
  await expect(page.getByRole("heading", { name: "Edit profile" })).toBeVisible()
})
```

**Visibility/DOM Assertions:**
```typescript
// Playwright
await expect(page.getByRole("tab", { name: "Forms" })).toBeVisible()
await expect(page.getByText("Yes. It adheres...")).toBeHidden()
```

**Loops in Tests:**
```typescript
// E2E — validate multiple elements
test("loads with tab bar showing all 6 tabs", async ({ page }) => {
  const tabs = ["Forms", "Overlays", "Navigation", "Feedback", "Data Display", "Layout"]
  for (const tab of tabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible()
  }
})
```

## Setup Files

**Location:** `packages/ui/src/test/setup.ts`

**Contents:**
```typescript
import "@testing-library/jest-dom"
```

**Purpose:**
- Imports testing utilities for DOM assertions
- Automatically loaded by vitest in `setupFiles` config

---

*Testing analysis: 2026-04-14*

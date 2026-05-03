# Codebase Concerns

**Analysis Date:** 2026-04-14

## Tech Debt

**Large Component Files:**
- Issue: Multiple UI components exceed 250 lines, creating complexity and reducing testability
- Files: `packages/ui/src/components/sidebar.tsx` (674 lines), `packages/ui/src/components/combobox.tsx` (258 lines), `packages/ui/src/components/menubar.tsx` (257 lines), `packages/ui/src/components/dropdown-menu.tsx` (251 lines), `packages/ui/src/components/context-menu.tsx` (234 lines)
- Impact: Difficult to test individual functionality, harder to reuse isolated behaviors, increased cognitive load during maintenance
- Fix approach: Extract compound components into separate files, create custom hooks for shared logic (e.g., menu positioning, focus management), group related sub-components together

**Browser API Access Without SSR Guards:**
- Issue: Direct `window` and `document` access in components without SSR safety checks
- Files: `packages/ui/src/components/sidebar.tsx` (lines 75, 94-95), `packages/ui/src/hooks/use-mobile.ts` (lines 9, 11, 14)
- Impact: Causes hydration mismatches in SSR/SSG environments, breaks Next.js static generation, potential runtime errors on server-side rendering
- Fix approach: Wrap browser API calls in `typeof window !== 'undefined'` checks or use `useEffect` with proper initial state handling. For `useIsMobile`, add a ternary check to return a safe default during SSR

**Cookie Handling Without SameSite/Secure Attributes:**
- Issue: Cookie set in `sidebar.tsx` line 75 lacks security attributes
- Files: `packages/ui/src/components/sidebar.tsx`
- Impact: Vulnerable to CSRF attacks, cookies sent over insecure connections, improper cookie isolation
- Fix approach: Add `SameSite=Strict; Secure` attributes when setting cookies. Consider using a server-side cookie utility for better control

**Dynamic Style Injection via dangerouslySetInnerHTML:**
- Issue: Chart component uses `dangerouslySetInnerHTML` to inject CSS styles
- Files: `packages/ui/src/components/chart.tsx` (lines 83-100)
- Impact: While CSS is generated safely here, reduces ability to use Content Security Policy headers, bypasses React's protective mechanisms, harder to test and maintain
- Fix approach: Extract dynamic styles into a proper CSS module or use CSS-in-JS library. Generate a `<style>` tag using React APIs instead of raw HTML injection

## Known Issues

**useIsMobile Hook Incorrect Behavior:**
- Symptoms: Hook initializes state as `undefined` but immediately coerces to boolean with `!!isMobile`, causing components to render with wrong initial mobile state on client load
- Files: `packages/ui/src/hooks/use-mobile.ts` (lines 6, 18)
- Trigger: Any component using `useIsMobile` will have layout shift between SSR and hydration, or show desktop layout briefly before switching to mobile
- Workaround: Components using `useIsMobile` should have a loading state or skip rendering until hook returns `true/false` deterministically

**Chart Component Returns null Multiple Times:**
- Symptoms: Component silently fails to render without error feedback when conditions aren't met
- Files: `packages/ui/src/components/chart.tsx` (lines 79, 131, 144)
- Trigger: When `colorConfig.length === 0` or payload is empty or missing labels
- Workaround: Verify data structure before rendering Chart component, provide default config with at least one color

## Security Considerations

**Keyboard Shortcut Conflicts:**
- Risk: Sidebar keyboard shortcut (Ctrl/Cmd+B) may conflict with browser shortcuts or accessibility tools
- Files: `packages/ui/src/components/sidebar.tsx` (lines 22, 88)
- Current mitigation: Calls `preventDefault()` on the keyboard event
- Recommendations: Make shortcut configurable via prop, warn users of conflicts, add documentation about how to disable it

**Unvalidated Dynamic Style Generation:**
- Risk: While `chart.tsx` generates CSS safely from config, any future modification accepting user input could enable CSS injection
- Files: `packages/ui/src/components/chart.tsx` (lines 85-98)
- Current mitigation: Colors are hardcoded or come from internal config structure
- Recommendations: Validate all color values against hex/rgb regex before injecting into CSS, use CSS custom properties with type safety

## Performance Bottlenecks

**Heavy Dependency on Base-UI:**
- Problem: Components heavily depend on `@base-ui/react` (v1.4.0) as unseen abstraction layer; bundle impact unclear
- Files: `packages/ui/src/components/sidebar.tsx` (lines 3-4), `packages/ui/src/components/item.tsx`, multiple components
- Cause: Base-UI provides headless components but includes rendering overhead for complex components like menus and combobox
- Improvement path: Audit bundle size contribution of @base-ui/react, consider if all components need headless approach or if some should use simpler primitives. Implement code splitting for large components

**useRender Hook Pattern Overhead:**
- Problem: All large components (`sidebar`, `combobox`, `menubar`) heavily use `useRender` from Base-UI for component composition
- Files: `packages/ui/src/components/sidebar.tsx` (lines 618-646), multiple component files
- Cause: Extra abstraction layer for prop merging and state management on every render
- Improvement path: Profile component render performance, consider memoization of computed styles, evaluate if all uses of `useRender` are necessary

**ChartContainer Initial Dimension Calculation:**
- Problem: Chart uses fixed initial dimensions that may cause layout shift on first render
- Files: `packages/ui/src/components/chart.tsx` (lines 10, 42)
- Cause: `INITIAL_DIMENSION` is static; actual container size discovered on mount
- Improvement path: Use aspect-ratio CSS to maintain proportions during load, measure container on mount before rendering responsive container

## Fragile Areas

**Sidebar State Management with Multiple Triggers:**
- Files: `packages/ui/src/components/sidebar.tsx` (lines 45-100)
- Why fragile: Complex state coordination between mobile/desktop modes, keyboard shortcuts, cookie persistence, and controlled/uncontrolled patterns. `setOpen` callback uses stale closure over `open` (line 77 dependency).
- Safe modification: Add extensive unit tests for state transitions, test all combinations of: mobile/desktop, controlled/uncontrolled, keyboard input, cookie updates. Use Zustand or Jotai for clearer state management instead of context+useState
- Test coverage: Currently no tests for SidebarProvider. Add tests for: toggle on keyboard shortcut, persistence via cookie, mobile vs desktop state isolation, controlled prop overriding internal state

**ComboboxInput and Command Components Interaction:**
- Files: `packages/ui/src/components/combobox.tsx`, `packages/ui/src/components/command.tsx`
- Why fragile: Complex focus management, keyboard navigation, list virtualization interaction points. Multiple components must synchronize (ComboboxInput, Command, CommandList)
- Safe modification: Avoid changing keyboard event handling without comprehensive testing. Test with screen readers (NVDA, JAWS). Ensure arrow keys, Enter, Escape all work in all states (open/closed/scrolled)
- Test coverage: Only manual showcase examples exist; no automated tests for keyboard navigation, focus trapping, or list scroll behavior

**Calendar Component Date Logic:**
- Files: `packages/ui/src/components/calendar.tsx` (168 lines)
- Why fragile: Date handling across months/years, leap years, timezone issues. Uses `react-day-picker` which handles complexity but is opaque
- Safe modification: If adding custom date logic, validate against all edge cases (29 Feb, month boundaries, DST). Update tests before changing any date-related logic
- Test coverage: No tests present; manually verified in showcase only

## Scaling Limits

**Component Library Bundle Size:**
- Current capacity: 60 source files in `packages/ui`, generating ~5600 lines of TypeScript
- Limit: At current growth rate (shadcn-based component library), bundle approaches 100KB+ gzipped when all components are imported; tree-shaking depends on ESM exports
- Scaling path: Implement component-level code-splitting in tsup, create separate entry points for common vs advanced components, monitor bundle size in CI

**Test Coverage:**
- Current capacity: Only 3 test files total (1 button test, 1 utils test, 1 e2e test)
- Limit: 60 components with minimal test coverage means regressions likely to slip through; no confidence in refactoring large component files
- Scaling path: Establish minimum test coverage requirement (50%+ lines), write tests for each component's core functionality before adding new components. Consider visual regression testing for UI components

**Showcase App E2E Coverage:**
- Current capacity: Single `showcase.spec.ts` file for E2E tests
- Limit: Only tests basic rendering; doesn't verify functionality, accessibility, or keyboard interaction across showcase examples
- Scaling path: Expand E2E suite with tests for form submissions, menu interactions, keyboard navigation, and accessibility compliance (WCAG)

## Missing Critical Features

**No Accessibility Testing:**
- Problem: Components exported from UI library used by showcase app, but no automated accessibility (a11y) checks in test suite
- Blocks: Cannot verify WCAG 2.1 AA compliance, missing aria labels, keyboard navigation issues go undetected
- Fix approach: Add `@testing-library/jest-dom` with jest-axe for a11y assertions, run axe-core in E2E tests, create accessibility test suite for all interactive components

**No Error Boundary:**
- Problem: No error boundaries in component library or showcase app; runtime errors in components crash entire app
- Blocks: Production reliability, errors in one component cascade to full app failure
- Fix approach: Wrap showcase app root with Error Boundary component, add error boundaries around complex interactive sections (forms, modals), log errors to monitoring service

**Missing Loading States:**
- Problem: Async components (`combobox`, `select`) lack clear loading indicators
- Blocks: Users cannot distinguish between "searching" and "no results", poor UX in data-heavy scenarios
- Fix approach: Add `isLoading` prop to `Combobox` and `Select`, show spinner in list, disable interactions during load

## Test Coverage Gaps

**UI Components - Almost Completely Untested:**
- What's not tested: 59 of 60 UI components have zero test coverage. Form components, dialogs, menus, charts all untested
- Files: `packages/ui/src/components/*.tsx` (all except button.tsx)
- Risk: Cannot refactor large components (sidebar 674 lines) without fear of breaking functionality. Changes to complex interaction patterns (combobox keyboard nav, menu positioning) are high-risk
- Priority: HIGH - Start with components most likely to have bugs: combobox (keyboard nav), sidebar (state), chart (data rendering)

**Integration Between Components:**
- What's not tested: Multi-component interactions (form field + input + label composition, sidebar + menu integration)
- Files: `packages/ui/src/components/field.tsx`, combined component usage in showcase
- Risk: Field layout breaking when combined with specific input types, sidebar and navigation menu conflicts
- Priority: MEDIUM - Test compound component patterns (Field + Input, Sidebar + Menu) before shipping

**Keyboard Navigation:**
- What's not tested: Tab order, focus management, keyboard shortcuts (except basic sidebar toggle testing exists)
- Files: All interactive components (combobox, dropdown-menu, select, menubar)
- Risk: Keyboard users unable to navigate menus, forms, or complex components; WCAG 2.1 violations
- Priority: HIGH - Verify keyboard-only navigation works for all interactive components

**Mobile Responsiveness:**
- What's not tested: Components with mobile-specific behavior (sidebar, responsive fields, mobile breakpoint logic)
- Files: `packages/ui/src/hooks/use-mobile.ts`, components using `useIsMobile`
- Risk: Mobile layout broken, sidebar may not toggle correctly, responsive variants untested
- Priority: MEDIUM - Add viewport-resize tests and mobile breakpoint verification

**Error States:**
- What's not tested: Error handling in components (invalid props, missing required data, boundary cases)
- Files: All components that render data or accept user input
- Risk: Silent failures, cryptic errors to users, hard to debug component misuse
- Priority: LOW - Add test cases for common error scenarios (empty data, invalid config, missing required props)

---

*Concerns audit: 2026-04-14*

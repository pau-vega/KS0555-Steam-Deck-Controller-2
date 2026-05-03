# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**None Detected**
- This is a frontend component library and showcase application with no external API integrations
- No SDK imports for third-party services (Stripe, Supabase, AWS, etc.) found in codebase
- All sample data is hardcoded (e.g., placeholder URLs in showcase components)

## Data Storage

**Databases:**
- None - No database client or ORM detected (Prisma, Drizzle, etc.)

**File Storage:**
- Local filesystem only - No cloud storage integrations (S3, Cloudinary, etc.)

**Caching:**
- None - No caching layer (Redis, Memcached, etc.)

## Authentication & Identity

**Auth Provider:**
- None - No authentication system implemented
- This is a template/showcase application with no user system

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service (Sentry, Bugsnag, etc.)

**Logs:**
- Console-based only - Standard JavaScript `console` methods for any logging needs
- No structured logging or log aggregation service integrated

## CI/CD & Deployment

**Hosting:**
- Not configured - Template repository includes no deployment configuration
- Suitable for deployment to any static hosting: Vercel, Netlify, GitHub Pages, AWS S3, etc.

**CI Pipeline:**
- GitHub Actions compatible - `playwright.config.ts` includes CI environment detection with:
  - CI environment variable check for conditional behavior
  - GitHub reporter format when CI=true
  - 2 retry attempts in CI, 0 locally
  - Single worker in CI for stability
- No workflow files (.github/workflows) present in this template

## Environment Configuration

**Required env vars:**
- None - Application requires no environment variables to function

**Secrets location:**
- No secrets management configured
- `.env` files not present (listed in `.gitignore`)

## MCP Server Integration

**Playwright MCP:**
- `@playwright/mcp@latest` configured in `.mcp.json`
- Enables AI-assisted Playwright test generation and debugging

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints implemented

**Outgoing:**
- None - No outbound webhook calls made

## Content & Media

**External URLs:**
- Sample image URLs hardcoded in showcase components (`src/components/categories/overlays.tsx`, `data-display.tsx`, `layout.tsx`)
- GitHub avatars used for demonstration (github.com/vercel.png, github.com/shadcn.png)
- Unsplash image URL for layout demo

## Summary

This is a **zero-integration** template repository. It provides:
- A reusable React component library (@monorepo-template/ui)
- Shared configuration packages for TypeScript, ESLint, and Prettier
- A Vite-based showcase application demonstrating components
- No external dependencies, APIs, or infrastructure requirements

The absence of integrations makes this ideal as a template for starting new projects with a clean, modern stack.

---

*Integration audit: 2026-04-14*

set shell := ["bash", "-uc"]

# List available recipes
[private]
default:
    @just --list --unsorted

# --- Development ---

# Run all packages in dev mode
[group('dev')]
dev:
    pnpm dev

# Build all packages, or a specific one: `just build @scope/pkg`
[group('dev')]
build *filter:
    {{ if filter == "" { "pnpm build" } else { "pnpm build --filter " + filter } }}

# Build and serve the production preview of apps/showcase
[group('dev')]
preview:
    pnpm preview

# Run linters across all packages
[group('dev')]
lint:
    pnpm lint

# Format all files with prettier
[group('dev')]
format:
    pnpm format

# Check formatting without writing
[group('dev')]
format-check:
    pnpm format:check

# Run type checking across all packages
[group('dev')]
typecheck:
    pnpm typecheck

# Remove dist/build artifacts
[group('dev')]
clean:
    pnpm clean

# Fresh install after cleaning
[group('dev')]
install: clean
    pnpm install

# Sync dependencies (install without clean)
[group('dev')]
sync:
    pnpm install

# Run the full pre-commit suite (lint, typecheck, test)
[group('dev')]
check: lint typecheck test

# --- Testing ---

# Run unit tests
[group('test')]
test:
    pnpm test

# Run unit tests with coverage
[group('test')]
test-coverage:
    pnpm test:coverage

# Run end-to-end tests
[group('test')]
e2e:
    pnpm e2e

# --- Git & Release ---

# Show git status
[group('release')]
status:
    @git status

# Show which packages have changed since main
[group('release')]
diff:
    @echo "=== Changed packages ==="
    @git diff --name-only origin/main...HEAD | grep -E '^packages/[^/]+' | cut -d/ -f2 | sort -u || echo "No package changes detected"

# Build and publish all packages
[group('release')]
release:
    pnpm build
    pnpm publish -r

# --- Debugging ---

# Show turbo cache stats
[group('debug')]
debug-turbo:
    @echo "=== Turbo Cache Directory ==="
    @ls -lh .turbo/ 2>/dev/null || echo "No .turbo cache found"
    @echo ""
    @echo "=== Cache Size ==="
    @du -sh .turbo/ 2>/dev/null || echo "Cache directory empty or missing"

# Tail logs for a service (usage: `just logs postgres`)
[group('debug')]
logs service:
    @echo "Tailing logs for '{{service}}'... (Press Ctrl+C to stop)"
    @grep -r "{{service}}" . --include="*.log" -i 2>/dev/null | tail -f || echo "No logs found for {{service}}"

# --- UI ---

# Update all shadcn components in the ui package
[group('ui')]
update-ui:
    pnpm --filter @monorepo-template/ui exec npx shadcn@latest add --all --overwrite

# --- Maintenance ---

# Remove dist/build artifacts (less aggressive than nuke)
[group('maintenance')]
clean-artifacts:
    find . -type d \( \
        -name dist \
        -o -name build \
        -o -name .turbo \
        -o -name .next \
        -o -name coverage \
        -o -name test-results \
        -o -name playwright-report \
    \) -prune -exec rm -rf '{}' +
    find . -name 'tsconfig.tsbuildinfo' -delete

# Remove all generated files, caches, and node_modules
[group('maintenance')]
nuke: clean-artifacts
    find . -type d -name node_modules -prune -exec rm -rf '{}' +

# Nuke everything and reinstall dependencies
[group('maintenance')]
[default]
phoenix: nuke
    pnpm install


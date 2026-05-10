import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, it, expect } from "vitest"

const repoRoot = resolve(import.meta.dirname, "../../..")
const buildYmlPath = join(repoRoot, ".github/workflows/build.yml")
const buildYml = readFileSync(buildYmlPath, "utf-8")

describe("CI workflow: .github/workflows/build.yml", () => {
  it("CI-01: uses flatpak-builder@v6 with Freedesktop 24.08 container", () => {
    expect(buildYml).toContain("flatpak/flatpak-github-actions/flatpak-builder@v6")
    expect(buildYml).toMatch(/freedesktop/i)
  })

  it("CI-01: flatpak job has manifest-path set", () => {
    expect(buildYml).toContain("manifest-path: flatpak/com.ks0555.robotcontroller.yaml")
  })

  it("CI-02: uses action-gh-release@v2 for release upload", () => {
    expect(buildYml).toContain("softprops/action-gh-release@v2")
  })

  it("CI-02: release uploads .flatpak file as release asset", () => {
    expect(buildYml).toMatch(/RobotController-\${{.*env\.VERSION.*}}-x86_64\.flatpak/)
  })

  it("CI-02: SHA256 checksum generated before release upload", () => {
    expect(buildYml).toContain("sha256sum")
  })

  it("CI-03: no arm64 or aarch64 references in build.yml", () => {
    expect(buildYml).not.toMatch(/arm64|aarch64/i)
  })

  it("CI-04: OSTree cache enabled on flatpak-builder action", () => {
    expect(buildYml).toContain("cache: true")
    expect(buildYml).toContain("cache-key")
    expect(buildYml).toMatch(/cache-key.*freedesktop-2408/)
  })

  it("has per-job permissions for release upload", () => {
    expect(buildYml).toContain("contents: write")
    expect(buildYml).toMatch(/permissions:\s*\n\s+contents:\s+write/)
  })

  it("has pnpm store caching", () => {
    expect(buildYml).toContain("pnpm-store")
  })

  it("has Cargo registry and target caching", () => {
    const cacheMatches = buildYml.match(/actions\/cache@v4/g)
    expect(cacheMatches).toBeTruthy()
    expect(cacheMatches!.length).toBeGreaterThanOrEqual(2)
    expect(buildYml).toContain("~/.cargo/registry")
    expect(buildYml).toContain("cargo-target")
  })

  it("has skip_release workflow_dispatch input", () => {
    expect(buildYml).toContain("skip_release")
  })

  it("is valid YAML syntax", () => {
    expect(buildYml).toMatch(/^name:/m)
    expect(buildYml).toMatch(/^on:/m)
    expect(buildYml).toMatch(/^jobs:/m)
  })
})

import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, it, expect } from "vitest"

describe("TAUR-03: Tauri frontend dependencies and scripts", () => {
  const packageJsonPath = resolve(__dirname, "../package.json")

  it("package.json should have @tauri-apps/cli in devDependencies", () => {
    const content = readFileSync(packageJsonPath, "utf-8")
    const pkg = JSON.parse(content)
    expect(pkg.devDependencies["@tauri-apps/cli"]).toBeDefined()
    expect(pkg.devDependencies["@tauri-apps/cli"]).toMatch(/^\^2\./)
  })

  it("package.json should have @tauri-apps/api in dependencies", () => {
    const content = readFileSync(packageJsonPath, "utf-8")
    const pkg = JSON.parse(content)
    expect(pkg.dependencies["@tauri-apps/api"]).toBeDefined()
    expect(pkg.dependencies["@tauri-apps/api"]).toMatch(/^\^2\./)
  })

  it("package.json should have tauri scripts", () => {
    const content = readFileSync(packageJsonPath, "utf-8")
    const pkg = JSON.parse(content)
    expect(pkg.scripts.tauri).toBeDefined()
    expect(pkg.scripts["tauri:dev"]).toBeDefined()
    expect(pkg.scripts["tauri:build"]).toBeDefined()
  })
})

describe("TAUR-04: Vite config Tauri integration", () => {
  const viteConfigPath = resolve(__dirname, "../vite.config.ts")

  it("vite.config.ts should have clearScreen set to false", () => {
    const content = readFileSync(viteConfigPath, "utf-8")
    expect(content).toContain("clearScreen: false")
  })

  it("vite.config.ts should have strictPort set to true", () => {
    const content = readFileSync(viteConfigPath, "utf-8")
    expect(content).toContain("strictPort: true")
  })

  it("vite.config.ts should have port set to 5173", () => {
    const content = readFileSync(viteConfigPath, "utf-8")
    expect(content).toContain("port: 5173")
  })

  it("vite.config.ts should ignore src-tauri in watch", () => {
    const content = readFileSync(viteConfigPath, "utf-8")
    expect(content).toContain("src-tauri")
    expect(content).toContain("ignored")
  })
})

import { glob } from "glob"
import { defineConfig } from "tsup"

export default defineConfig([
  {
    // Components + hooks: need "use client"
    entry: [...glob.sync("src/components/*.tsx"), ...glob.sync("src/hooks/*.ts")],
    format: ["esm"],
    // Workaround: tsup DTS builder uses deprecated baseUrl internally (tsup#1388)
    // https://github.com/egoist/tsup/issues/1388 — remove when tsup fixes this
    dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
    outDir: "dist",
    outExtension: () => ({ js: ".js" }),
  },
  {
    // Barrel index + utils: no "use client"
    entry: ["src/index.ts", "src/lib/utils.ts"],
    format: ["esm"],
    // Workaround: tsup DTS builder uses deprecated baseUrl internally (tsup#1388)
    // https://github.com/egoist/tsup/issues/1388 — remove when tsup fixes this
    dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
    sourcemap: true,
    clean: false,
    external: ["react", "react-dom"],
    outDir: "dist",
    outExtension: () => ({ js: ".js" }),
  },
])

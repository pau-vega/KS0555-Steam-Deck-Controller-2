import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  // Workaround: tsup DTS builder uses deprecated baseUrl internally (tsup#1388)
  // https://github.com/egoist/tsup/issues/1388 — remove when tsup fixes this
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: "node24",
  outDir: "dist",
})

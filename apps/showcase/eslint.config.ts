import { react } from "@monorepo-template/eslint-config"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...react,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])

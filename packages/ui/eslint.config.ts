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
    rules: {
      "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": "off",
      "react-refresh/only-export-components": "off",
      "@eslint-react/no-nested-component-definitions": "off",
      "@eslint-react/component-hook-factories": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
])

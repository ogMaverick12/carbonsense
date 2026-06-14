import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "src/vite-env.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React 19 compiler rule: flagged as warn (not error) since these patterns are
      // intentional in this codebase and safe in React 18 concurrent mode.
      "react-hooks/set-state-in-effect": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Allow underscore-prefixed args/vars for intentionally-unused values
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Console use is fine for this project's diagnostic/telemetry surface;
      // surfaced as a warning so accidental debug logs are still visible.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/tests/**/*.ts", "server.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    // Service worker runs in its own global scope (not browser, not node)
    files: ["public/sw.js"],
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  }
);

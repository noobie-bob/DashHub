import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import oxlintPlugin from "eslint-plugin-oxlint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    plugins: {
      oxlint: oxlintPlugin,
    },
  },
  // 👇 IMPORTANT: spread, don’t nest
  ...oxlintPlugin.configs["flat/recommended"],
]);



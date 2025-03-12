import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import typescript from "typescript-eslint";

export default [
  {
    name: "ignore",
    ignores: [
      "test-results/",
      ".react-router/**",
      "build/",
      "coverage/",
      "server/build/",
      "playwright-report/",
      "playwright/.cache",
    ],
  },
  {
    name: "eslint/recommended:",
    ...eslint.configs.recommended,
  },
  ...typescript.configs.recommended,
  {
    name: "react/recommended",
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: "18",
      },
    },
  },
  {
    name: "react/jsx",
    ...react.configs.flat["jsx-runtime"],
  },
  {
    name: "react/hooks",
    plugins: { "react-hooks": reactHooks },
  },
  {
    name: "jsx-a11y/recommended",
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    name: "simple-import-sort/recommended",
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    ...prettier,
  },
  {
    name: "globals",
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];

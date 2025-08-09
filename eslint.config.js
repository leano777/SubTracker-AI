// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config({
  ignores: [
    "dist",
    "build",
    "node_modules",
    ".eslintrc.*",
    "vite.config.ts.timestamp-*",
    "supabase/**",
    "tailwind.config.ts",
    "vitest.config.ts",
    "vite.config.ts",
  ],
}, {
  files: ["**/*.{js,jsx}"],
  extends: [js.configs.recommended],
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    "jsx-a11y": jsxA11y,
    import: importPlugin,
    prettier,
  },
  rules: {
    // Prettier integration
    ...prettierConfig.rules,
    "prettier/prettier": "error",
    // Basic rules for JS files
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
  },
}, {
  files: ["**/*.{ts,tsx}"],
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parser: tseslint.parser,
    parserOptions: {
      project: ["./tsconfig.app.json", "./tsconfig.node.json"],
      tsconfigRootDir: import.meta.dirname,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    "jsx-a11y": jsxA11y,
    import: importPlugin,
    prettier,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.app.json",
      },
    },
  },
  rules: {
    // Prettier integration
    ...prettierConfig.rules,
    "prettier/prettier": "error",

    // React hooks rules
    ...reactHooks.configs.recommended.rules,
    "react-hooks/exhaustive-deps": "warn",

    // React refresh
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    // React rules (Airbnb-style)
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "off", // Not needed with new JSX transform
    "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
    "react/prop-types": "off", // We use TypeScript
    "react/jsx-filename-extension": [
      "warn",
      {
        extensions: [".tsx", ".jsx"],
      },
    ],
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",

    // TypeScript rules (strict)
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "off",

    // Import rules (Airbnb-style)
    "import/prefer-default-export": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
        tsx: "never",
        js: "never",
        jsx: "never",
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.{ts,tsx}",
          "**/*.spec.{ts,tsx}",
          "**/vite.config.ts",
          "**/vitest.config.ts",
          "**/*.d.ts",
        ],
      },
    ],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        pathGroups: [
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    // Accessibility rules
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"],
      },
    ],

    // General code quality rules (Airbnb-style)
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: ["state"],
      },
    ],
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "arrow-spacing": "error",
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
  },
}, {
  files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-extraneous-dependencies": "off",
  },
}, {
  files: ["vite.config.ts", "vitest.config.ts"],
  rules: {
    "import/no-extraneous-dependencies": "off",
  },
}, storybook.configs["flat/recommended"]);

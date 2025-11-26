import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);

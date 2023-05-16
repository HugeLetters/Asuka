/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "unicorn"],
  rules: {
    "no-unused-vars": "off",
    "unicorn/prefer-top-level-await": "off",
    "unicorn/filename-case": ["warn", { cases: { camelCase: true } }],
    "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
  },
  ignorePatterns: "old",
};

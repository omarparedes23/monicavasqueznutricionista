import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// Flat config autocontenida. No se usa eslint-config-next porque su
// patch de rushstack (modern-module-resolution) falla bajo ESLint 9
// con la resolución de pnpm ("calling module was not recognized").
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "supabase/**",
      // Archivo generado por Next.
      "next-env.d.ts",
      // Scripts de trabajo en la raíz (no son parte de la app).
      "*.mjs",
    ],
  },
  js.configs.recommended,
  {
    // Configs CommonJS en la raíz (postcss.config.js).
    files: ["*.config.js"],
    languageOptions: {
      globals: { module: "readonly", require: "readonly", process: "readonly" },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      // El compilador TS ya detecta variables indefinidas; no-undef no
      // entiende los tipos ni el JSX transform de React 19.
      "no-undef": "off",
      // La base de código usa `as any` para auth.admin (supabase-js) y
      // tiene imports sin usar: se reporta como warning, no error.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 19 + nuevo JSX transform: no requiere importar React,
      // y los tipos cubren las props.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Deuda menor existente (comillas sin escapar): warning.
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;

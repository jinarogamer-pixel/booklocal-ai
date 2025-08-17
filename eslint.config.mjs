import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**", 
      "supabase/functions/**", 
      "booklocal-ai_for_claude.tar.gz",
      "booklocal-ai/.next/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "*.config.*",
      "public/**"
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Make unused vars warnings, not errors
      "@typescript-eslint/no-require-imports": "off", // Allow require imports (needed for Next.js build files)
    }
  }
];

export default eslintConfig;

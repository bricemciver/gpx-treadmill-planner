import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["import", "eslint", "typescript", "unicorn", "nextjs", "oxc"],
  categories: {
    correctness: "error",
  },
  options: {
    typeAware: true,
  },
  rules: {},
  env: {
    builtin: true,
  },
});

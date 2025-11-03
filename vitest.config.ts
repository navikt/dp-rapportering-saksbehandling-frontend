import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "playwright/**"],
    setupFiles: ["./vitest/helpers/setup.ts"],
    environment: "jsdom",
    // Finn tester både i app/ og vitest/ mapper
    include: ["**/*.{test,spec}.{ts,tsx}", "vitest/**/*.{test,spec}.{ts,tsx}"],
    watch: false,
    coverage: {
      provider: "istanbul",
      include: ["app/*"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});

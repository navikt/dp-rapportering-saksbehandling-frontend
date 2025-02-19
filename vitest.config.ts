import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    setupFiles: ["tests/vitest/helpers/setup.ts"],
    dir: "./tests/vitest",
    watch: false,
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["app/*"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});

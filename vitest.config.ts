import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    setupFiles: ["./vitest/helpers/setup.ts"],
    dir: "./vitest",
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

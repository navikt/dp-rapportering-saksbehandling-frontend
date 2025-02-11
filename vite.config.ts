import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/rapportering/123",
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    cssMinify: true,
    ssr: false,
  },
});

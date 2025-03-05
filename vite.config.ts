import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { reactRouterDevTools } from "react-router-devtools";

export default defineConfig({
  base: "/rapportering",
  plugins: [reactRouterDevTools(), reactRouter(), tsconfigPaths()],
  build: {
    cssMinify: true,
    ssr: true,
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});

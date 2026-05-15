import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

const base =
  process.env.NODE_ENV === "production"
    ? "https://cdn.nav.no/teamdagpenger/dp-rapportering-saksbehandling-frontend/client/"
    : "/";

export default defineConfig({
  base,
  plugins: [reactRouter()],
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
    tsconfigPaths: true,
  },
});

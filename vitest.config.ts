import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // W testach neutralizujemy "server-only" (rzuca poza kontekstem serwera).
      "server-only": fileURLToPath(new URL("./tests/mocks/empty.ts", import.meta.url)),
    },
  },
});

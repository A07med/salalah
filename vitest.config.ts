import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "test/server-only.ts"),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    setupFiles: ["./test/setup.ts"],
    restoreMocks: true,
  },
});

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "app/components"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "."),
      },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "test/setupTests.ts")],
    coverage: {
      reporter: ["text", "lcov"],
    },
    include: ["**/*.test.tsx"],
  },
});

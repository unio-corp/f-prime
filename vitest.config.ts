import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Logica pura: nessun ambiente DOM, nessun plugin React. L'alias replica
// quello di `tsconfig.json`, che Vitest non legge da solo.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

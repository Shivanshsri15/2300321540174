import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      logging_middleware: path.resolve(
        __dirname,
        "../logging_middleware/src/index.ts"
      ),
    },
  },
});

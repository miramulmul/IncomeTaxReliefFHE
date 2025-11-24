import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          fhevm: ["fhevmjs"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["fhevmjs"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Explicitly root to the directory that contains this config file,
  // so `index.html` is always resolved correctly regardless of the
  // working directory from which `vite build` is invoked.
  root: fileURLToPath(new URL(".", import.meta.url)),
  server: {
    port: 3000,
    // Proxy API calls to Flask so there are no CORS preflight issues in dev.
    proxy: {
      "/analyze": "http://localhost:5000",
      "/health":  "http://localhost:5000",
    },
  },
});

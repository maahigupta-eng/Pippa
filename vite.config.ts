import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In `npm run dev`, API calls are proxied to `wrangler dev` on port 8787.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://127.0.0.1:8787" } },
});

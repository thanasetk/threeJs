import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Pages workflow sets BASE_PATH=/threeJs/; local dev stays at /.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});

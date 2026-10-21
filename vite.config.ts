import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The ThreeUI source lives in src/shaders, so the package import names from the
// configured usage resolve to these local files instead of an npm package.
// The Pages workflow sets BASE_PATH=/threeJs/; local dev stays at /.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@designcodeio/threeui/style.css", replacement: fileURLToPath(new URL("./src/shaders/threeui.css", import.meta.url)) },
      { find: /^@designcodeio\/threeui$/, replacement: fileURLToPath(new URL("./src/shaders/index.ts", import.meta.url)) },
    ],
  },
});

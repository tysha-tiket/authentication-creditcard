import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5273 },
  build: {
    // The icon grid imports the whole `tds library/tds icon` drop as URLs. Left at the
    // default 4 KB threshold, every one of those thousand-odd files would be base64'd
    // into the JS bundle and downloaded before the page renders; as emitted files the
    // browser only fetches the tiles that scroll into view.
    assetsInlineLimit: 0,
  },
});

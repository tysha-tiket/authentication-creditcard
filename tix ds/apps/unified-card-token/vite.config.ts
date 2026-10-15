import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // `host` so the prototype can be opened on a phone on the same Wi-Fi.
  server: { port: 5277, host: true },
});

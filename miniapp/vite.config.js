import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import terminal from "vite-plugin-terminal";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),nodePolyfills(), terminal()],
  server: {
    port: 3000,
    allowedHosts: ["7cb2-185-107-57-7.ngrok-free.app"],
  },
  
});

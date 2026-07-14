import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: true,
  },
  build: {
    // Default "assets" collides with an nginx-proxy-manager location
    // block that 404s any "/a*" prefixed path on dev.o-murphy.net.
    assetsDir: "static",
  },
});

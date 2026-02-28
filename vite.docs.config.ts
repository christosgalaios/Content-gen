import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path";

export default defineConfig({
  root: "docs-app",
  base: "/Content-gen/",
  publicDir: path.resolve(__dirname, "public"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            path.resolve(__dirname, "src/**/*.{ts,tsx}"),
            path.resolve(__dirname, "docs-app/**/*.{ts,tsx}"),
          ],
          theme: {
            extend: {
              colors: {
                brand: {
                  primary: "#FF6B35",
                  secondary: "#004E89",
                  accent: "#F7C948",
                  dark: "#1A1A2E",
                  light: "#F5F5F5",
                },
              },
              fontFamily: {
                display: ["Montserrat", "Inter", "sans-serif"],
                body: ["Inter", "sans-serif"],
              },
            },
          },
          plugins: [],
        }),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});

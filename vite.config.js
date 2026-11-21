import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  // Caminhos relativos: funciona no GitHub Pages em qualquer subpasta
  // (ex.: https://<usuario>.github.io/listas-web/).
  base: "./",

  build: {
    // O GitHub Pages publica a pasta /docs do branch principal.
    outDir: "docs",
  },
});

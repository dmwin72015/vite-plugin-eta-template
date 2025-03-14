import { defineConfig } from "vite";
import useEtaTemplate from "../src";

export default defineConfig({
  plugins: [
    useEtaTemplate({
      entry: ["example/index.html", "example/views/**/*.eta"],
    }),
  ],
  root: "./",
  build: {
    rollupOptions: {
      input: ["example/index.html"],
    },
    outDir: "example/dist",
  },
});

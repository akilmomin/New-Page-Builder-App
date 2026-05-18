import { defineConfig } from "tsup";

export default defineConfig({
  entry:            ["src/index.ts"],
  outDir:           "dist",
  format:           ["esm", "cjs"],
  dts:              true,
  sourcemap:        true,
  clean:            true,
  splitting:        false,
  treeshake:        true,
  minify:           true,
  external:         ["react", "react-dom"],
  // Ensures Next.js App Router treats the built dist as a client module.
  // In plain React (Vite etc.) this string is ignored.
  banner:           { js: '"use client";' },
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});

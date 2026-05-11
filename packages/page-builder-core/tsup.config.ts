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
  minify:           false,
  external:         ["react", "react-dom"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});

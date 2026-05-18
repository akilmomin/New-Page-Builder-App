import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-page-builder"],
  webpack: (config) => {
    // Prefer the 'source' export condition so Next.js compiles the TS source
    // directly from the workspace package without needing a dist build.
    config.resolve.conditionNames = [
      "source",
      ...(config.resolve.conditionNames ?? ["browser", "module", "main"]),
    ];
    return config;
  },
};

export default nextConfig;

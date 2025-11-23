import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Freighter API'yi SSR'da external olarak işaretle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@stellar/freighter-api");
    }
    return config;
  },
};

export default nextConfig;

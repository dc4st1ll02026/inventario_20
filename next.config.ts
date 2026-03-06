import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
     '/api/**/*': ['./node_modules/.prisma/client/**/*'],
     '/*': ['./node_modules/.prisma/client/**/*'],
   },
};

export default nextConfig;

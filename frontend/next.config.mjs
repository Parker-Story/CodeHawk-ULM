/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Monaco Editor uses .ttf fonts that need to be handled as static assets
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;

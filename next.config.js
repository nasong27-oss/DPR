/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse uses canvas internally, exclude it
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
};

module.exports = nextConfig;

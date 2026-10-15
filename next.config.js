/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lib': require('path').join(__dirname, 'lib'),
      '@data': require('path').join(__dirname, 'data'),
      '@convex': require('path').join(__dirname, 'convex'),
    };
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@stocker/shared',
    '@stocker/analytics',
    '@stocker/market-data',
    '@stocker/advisor',
  ],
  webpack: (config) => {
    // Resolve .js imports to .ts source files for workspace packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;

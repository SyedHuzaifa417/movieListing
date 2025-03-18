/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
};

module.exports = nextConfig;

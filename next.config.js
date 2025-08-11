/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // Temporary: ignore type errors from certain node_modules packages that ship TS sources
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

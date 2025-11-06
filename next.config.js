/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_DEV_API_URL: process.env.NEXT_DEV_API_URL
  },
}

module.exports = nextConfig

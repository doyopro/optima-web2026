import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.guesty.com',
      },
      {
        protocol: 'https',
        hostname: 'guesty-listing-images.s3.amazonaws.com',
      },
    ],
  },
}

export default nextConfig

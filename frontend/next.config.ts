import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion': 'framer-motion'
    }
    return config
  }
}

export default nextConfig
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion/react': 'framer-motion',
      'motion': 'framer-motion'
    }
    return config
  }
}

export default nextConfig
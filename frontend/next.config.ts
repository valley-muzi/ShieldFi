import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  disableDevNotifications: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion/react': 'framer-motion',
      'motion': 'framer-motion'
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.raini.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }
};

export default nextConfig
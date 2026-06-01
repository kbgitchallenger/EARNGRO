import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // These packages stay in Node.js runtime — not bundled by webpack
  serverExternalPackages: ['pdf-parse', 'mammoth'],

  turbopack: {},

  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals)
        ? config.externals
        : config.externals ? [config.externals] : []

      config.externals = [
        ...existing,
        'canvas',
        'bufferutil',
        'utf-8-validate',
      ]
    }
    return config
  },
}

export default nextConfig
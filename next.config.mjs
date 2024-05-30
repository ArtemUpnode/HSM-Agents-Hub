/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3100'
        : 'http://localhost:6677'
  },
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export'
  }),
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false
    }

    return config
  }
}
export default nextConfig

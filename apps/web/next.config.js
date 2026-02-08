/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tikit/api', '@tikit/types', '@tikit/database', '@tikit/ai', '@tikit/ui'],
  output: 'standalone', // Required for Docker deployment
  typescript: {
    // Skip type checking during build (run separately with pnpm typecheck)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (run separately with pnpm lint)
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Server actions are enabled by default in Next.js 15
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;

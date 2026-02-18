/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@precisionflow/api',
    '@precisionflow/types',
    '@precisionflow/database',
    '@precisionflow/ai',
    '@precisionflow/ui',
  ],
  output: 'standalone', // Required for Docker deployment
  typescript: {
    // Type checking is now enforced during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Skip ESLint during build (run separately with pnpm lint)
    ignoreDuringBuilds: true,
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

type ExtendedNextConfig = NextConfig & {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
};

const nextConfig: ExtendedNextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['localhost'],
  },
  // Enable static optimization
  output: 'standalone',
  // Optimize bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
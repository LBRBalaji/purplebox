
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is the new configuration to allow cross-origin requests in development.
    allowedDevOrigins: [
      'https://6000-firebase-v2lakshmi-balaji-o2o-1756988156129.cluster-ubrd2huk7jh6otbgyei4h62ope.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;

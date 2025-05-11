/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lichsuviet.edu.vn',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'http://localhost:5000/admin',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:5000/admin/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
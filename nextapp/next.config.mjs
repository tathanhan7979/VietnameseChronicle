/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cấu hình Next.js
  reactStrictMode: true,
  swcMinify: true,
  
  // Cấu hình cho API routes
  async rewrites() {
    return [
      // Chuyển hướng API calls đến Express backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  
  // Cấu hình hình ảnh
  images: {
    domains: ['lichsuviet.edu.vn'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lichsuviet.edu.vn',
        pathname: '/uploads/**',
      },
    ],
  },

  // Static export (nếu cần)
  // output: 'export',
};

export default nextConfig;
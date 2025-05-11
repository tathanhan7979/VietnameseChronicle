/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lichsuviet.edu.vn', 'localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/thoi-ky',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
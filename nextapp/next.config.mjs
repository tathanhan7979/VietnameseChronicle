/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lichsuviet.edu.vn', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lichsuviet.edu.vn',
      },
    ],
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
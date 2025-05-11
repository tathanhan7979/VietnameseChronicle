/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lichsuviet.edu.vn',
      'localhost',
      'picsum.photos',
      'via.placeholder.com',
      'placehold.co'
    ],
  },
  i18n: {
    locales: ['vi'],
    defaultLocale: 'vi',
  },
  // Các thiết lập SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Quy tắc chuyển hướng URL
  async redirects() {
    return [
      {
        source: '/su-kien/:id',
        destination: '/su-kien/:id/chi-tiet',
        permanent: true,
      },
      {
        source: '/nhan-vat/:id',
        destination: '/nhan-vat/:id/chi-tiet',
        permanent: true,
      },
      {
        source: '/di-tich/:id',
        destination: '/di-tich/:id/chi-tiet',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
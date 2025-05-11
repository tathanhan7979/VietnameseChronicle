import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Lịch Sử Việt Nam',
    template: '%s | Lịch Sử Việt Nam',
  },
  description: 'Nền tảng giáo dục lịch sử Việt Nam cung cấp thông tin chi tiết về các thời kỳ, sự kiện, nhân vật và di tích lịch sử Việt Nam.',
  keywords: 'lịch sử Việt Nam, thời kỳ lịch sử, Vua Hùng, nhân vật lịch sử, di tích lịch sử, văn hóa Việt Nam, dòng thời gian lịch sử',
  creator: 'lichsuviet.edu.vn',
  publisher: 'Lịch Sử Việt Nam',
  authors: [{ name: 'Lịch Sử Việt Nam', url: 'https://lichsuviet.edu.vn' }],
  themeColor: '#CF2A27',
  metadataBase: new URL('https://lichsuviet.edu.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://lichsuviet.edu.vn',
    title: 'Lịch Sử Việt Nam',
    description: 'Nền tảng giáo dục lịch sử Việt Nam cung cấp thông tin chi tiết về các thời kỳ, sự kiện, nhân vật và di tích lịch sử Việt Nam.',
    siteName: 'Lịch Sử Việt Nam',
    images: [
      {
        url: 'https://lichsuviet.edu.vn/uploads/banner-image.png',
        width: 1200,
        height: 630,
        alt: 'Lịch Sử Việt Nam',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Lịch Sử Việt Nam',
    description: 'Nền tảng giáo dục lịch sử Việt Nam cung cấp thông tin chi tiết về các thời kỳ, sự kiện, nhân vật và di tích lịch sử Việt Nam.',
    images: ['https://lichsuviet.edu.vn/uploads/banner-image.png'],
    card: 'summary_large_image',
  },
  viewport: 'width=device-width, initial-scale=1',
  verification: {
    google: 'google-site-verification-code', // Cần thay đổi
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
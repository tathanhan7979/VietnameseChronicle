import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Lịch Sử Việt Nam',
    default: 'Lịch Sử Việt Nam',
  },
  description: 'Khám phá lịch sử Việt Nam qua các thời kỳ với đầy đủ thông tin về sự kiện, nhân vật và di tích lịch sử.',
  metadataBase: new URL('https://lichsuviet.edu.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://lichsuviet.edu.vn',
    siteName: 'Lịch Sử Việt Nam',
    title: 'Lịch Sử Việt Nam',
    description: 'Khám phá lịch sử Việt Nam qua các thời kỳ với đầy đủ thông tin về sự kiện, nhân vật và di tích lịch sử.',
    images: [
      {
        url: 'https://lichsuviet.edu.vn/uploads/banner-image.png',
        width: 1200,
        height: 630,
        alt: 'Lịch Sử Việt Nam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lịch Sử Việt Nam',
    description: 'Khám phá lịch sử Việt Nam qua các thời kỳ với đầy đủ thông tin về sự kiện, nhân vật và di tích lịch sử.',
    images: ['https://lichsuviet.edu.vn/uploads/banner-image.png'],
  },
  alternates: {
    canonical: 'https://lichsuviet.edu.vn',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* Facebook SDK */}
        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0&appId=198066915623&autoLogAppEvents=1"
          nonce="ZmHM9HL1"
        ></script>
      </head>
      <body className={inter.className}>
        <header className="bg-red-600 text-white py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">Lịch Sử Việt Nam</a>
            <nav className="space-x-4">
              <a href="/" className="hover:underline">Trang chủ</a>
              <a href="/#timeline" className="hover:underline">Dòng thời gian</a>
              <a href="/#historical-figures" className="hover:underline">Nhân vật</a>
              <a href="/#historical-sites" className="hover:underline">Di tích</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Lịch Sử Việt Nam</h3>
                <p className="text-gray-400">Nơi khám phá lịch sử dân tộc Việt Nam từ thời kỳ Tiền sử đến hiện đại thông qua các sự kiện, nhân vật và di tích lịch sử nổi bật.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="text-gray-400 hover:text-white">Trang chủ</a></li>
                  <li><a href="/#timeline" className="text-gray-400 hover:text-white">Dòng thời gian</a></li>
                  <li><a href="/#historical-figures" className="text-gray-400 hover:text-white">Nhân vật lịch sử</a></li>
                  <li><a href="/#historical-sites" className="text-gray-400 hover:text-white">Di tích lịch sử</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
                <p className="text-gray-400">Email: contact@lichsuviet.edu.vn</p>
                <p className="text-gray-400">Điện thoại: (84) 123 456 789</p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="material-icons">facebook</span>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="material-icons">email</span>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="material-icons">phone</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} Lịch Sử Việt Nam. Bảo lưu mọi quyền.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
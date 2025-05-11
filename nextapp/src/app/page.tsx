import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trang Chủ | Lịch Sử Việt Nam',
  description: 'Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện, nhân vật và di tích lịch sử quan trọng.',
  alternates: {
    canonical: 'https://lichsuviet.edu.vn',
  },
  openGraph: {
    title: 'Trang Chủ | Lịch Sử Việt Nam',
    description: 'Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện, nhân vật và di tích lịch sử quan trọng.',
    url: 'https://lichsuviet.edu.vn',
  }
};

export default async function Home() {
  // Trong Next.js App Router, chúng ta có thể fetch dữ liệu trực tiếp trong component
  // Ví dụ: const periodsData = await fetch('https://lichsuviet.edu.vn/api/periods').then(res => res.json());
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">
        Chào mừng đến với <span className="text-red-600">Lịch Sử Việt Nam</span>
      </h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Trang web đang được chuyển đổi sang Next.js để cải thiện SEO và 
        trải nghiệm người dùng. Vui lòng quay lại sau.
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 max-w-4xl">
        <Link 
          href="/thoi-ky" 
          className="p-6 border border-gray-300 rounded-lg shadow-md text-center hover:bg-red-50 transition"
        >
          Các thời kỳ
        </Link>
        <Link 
          href="/su-kien" 
          className="p-6 border border-gray-300 rounded-lg shadow-md text-center hover:bg-red-50 transition"
        >
          Sự kiện lịch sử
        </Link>
        <Link 
          href="/nhan-vat" 
          className="p-6 border border-gray-300 rounded-lg shadow-md text-center hover:bg-red-50 transition"
        >
          Nhân vật lịch sử
        </Link>
        <Link 
          href="/di-tich" 
          className="p-6 border border-gray-300 rounded-lg shadow-md text-center hover:bg-red-50 transition"
        >
          Di tích lịch sử
        </Link>
      </div>
    </main>
  );
}
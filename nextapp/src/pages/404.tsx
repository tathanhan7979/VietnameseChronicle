import Head from 'next/head';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Không tìm thấy trang | Lịch Sử Việt Nam</title>
        <meta name="description" content="Không tìm thấy trang bạn yêu cầu." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đã thay đổi tên hoặc tạm thời không có sẵn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Về Trang Chủ
          </Link>
          <Link 
            href="/tim-kiem"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Tìm Kiếm
          </Link>
        </div>
      </div>
    </>
  );
}
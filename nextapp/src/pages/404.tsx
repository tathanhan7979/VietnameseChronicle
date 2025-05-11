import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout
      title="Không Tìm Thấy Trang | Lịch Sử Việt Nam"
      description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
      noIndex={true}
    >
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Trang Không Tìm Thấy
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
              Bạn có thể quay lại trang chủ để khám phá lịch sử Việt Nam.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Trở về trang chủ
              </Link>
              
              <Link 
                href="/tim-kiem"
                className="bg-transparent hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
              >
                Tìm kiếm
              </Link>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Khám phá các mục chính
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/su-kien"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-red-600 flex justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-center">Sự kiện</p>
                </Link>
                
                <Link 
                  href="/nhan-vat"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-red-600 flex justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-medium text-center">Nhân vật</p>
                </Link>
                
                <Link 
                  href="/di-tich"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-red-600 flex justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-center">Di tích</p>
                </Link>
                
                <Link 
                  href="/#timeline"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-red-600 flex justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-center">Dòng thời gian</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
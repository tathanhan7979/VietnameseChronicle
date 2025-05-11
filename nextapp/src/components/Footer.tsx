import React, { useState } from 'react';
import Link from 'next/link';

interface NewsletterData {
  email: string;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscribeError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    setIsSubscribing(true);
    setSubscribeError(null);
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubscribeSuccess(true);
        setEmail('');
      } else {
        const error = await response.json();
        setSubscribeError(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      setSubscribeError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Lịch Sử Việt Nam</h3>
            <p className="text-gray-400 mb-4">
              Khám phá lịch sử, văn hóa và di sản của dân tộc Việt Nam qua các thời kỳ lịch sử.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                  />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/su-kien" className="text-gray-400 hover:text-white transition-colors">
                  Sự kiện lịch sử
                </Link>
              </li>
              <li>
                <Link href="/nhan-vat" className="text-gray-400 hover:text-white transition-colors">
                  Nhân vật lịch sử
                </Link>
              </li>
              <li>
                <Link href="/di-tich" className="text-gray-400 hover:text-white transition-colors">
                  Di tích lịch sử
                </Link>
              </li>
              <li>
                <Link href="/tim-kiem" className="text-gray-400 hover:text-white transition-colors">
                  Tìm kiếm
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-400 mb-4">
              Nhận thông tin mới nhất về lịch sử Việt Nam qua email của bạn.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-red-500 text-white"
                  disabled={isSubscribing || subscribeSuccess}
                />
              </div>
              {subscribeError && (
                <p className="text-red-400 text-sm">{subscribeError}</p>
              )}
              {subscribeSuccess ? (
                <p className="text-green-400 text-sm">
                  Cảm ơn bạn đã đăng ký nhận tin!
                </p>
              ) : (
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                  {isSubscribing ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row md:justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            &copy; {currentYear} Lịch sử Việt Nam. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex space-x-4">
            <Link href="/chinh-sach-bao-mat" className="text-gray-400 hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="text-gray-400 hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
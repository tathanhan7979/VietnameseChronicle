import Link from 'next/link';
import { FACEBOOK_PAGE, YOUTUBE_CHANNEL } from '../lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
              Lịch Sử Việt Nam
            </Link>
            <p className="mt-4 text-gray-400">
              Khám phá hành trình lịch sử hào hùng của dân tộc Việt Nam, từ thời kỳ Tiền sử - Hồng Bàng đến hiện đại, 
              qua các triều đại, sự kiện lịch sử, nhân vật và di tích quan trọng.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href={FACEBOOK_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg
                  fill="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              <a
                href={YOUTUBE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <svg
                  fill="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h2 className="text-lg font-bold mb-4 text-white">Khám Phá</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/thoi-ky" className="text-gray-400 hover:text-primary transition-colors">
                  Thời Kỳ Lịch Sử
                </Link>
              </li>
              <li>
                <Link href="/su-kien" className="text-gray-400 hover:text-primary transition-colors">
                  Sự Kiện Lịch Sử
                </Link>
              </li>
              <li>
                <Link href="/nhan-vat" className="text-gray-400 hover:text-primary transition-colors">
                  Nhân Vật Lịch Sử
                </Link>
              </li>
              <li>
                <Link href="/di-tich" className="text-gray-400 hover:text-primary transition-colors">
                  Di Tích Lịch Sử
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h2 className="text-lg font-bold mb-4 text-white">Pháp Lý</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/quy-che-hoat-dong" className="text-gray-400 hover:text-primary transition-colors">
                  Quy Chế Hoạt Động
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-gray-400 hover:text-primary transition-colors">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan-su-dung" className="text-gray-400 hover:text-primary transition-colors">
                  Điều Khoản Sử Dụng
                </Link>
              </li>
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-primary transition-colors">
                  Lên Đầu Trang
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
            © {currentYear} Lịch Sử Việt Nam. Mọi Quyền Được Bảo Lưu.
          </p>
          <p className="mt-2">
            Nội dung trên trang web này được biên soạn cẩn thận, nhưng chúng tôi không đảm bảo tính chính xác tuyệt đối. 
            Nếu phát hiện sai sót, vui lòng góp ý để chúng tôi điều chỉnh.
          </p>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Lịch Sử Việt Nam</h3>
            <p className="text-gray-400">
              Nơi khám phá lịch sử dân tộc Việt Nam từ thời kỳ Tiền sử đến hiện đại thông qua các sự kiện, nhân vật và di tích lịch sử nổi bật.
            </p>
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
                <Link href="/#timeline" className="text-gray-400 hover:text-white transition-colors">
                  Dòng thời gian
                </Link>
              </li>
              <li>
                <Link href="/#historical-figures" className="text-gray-400 hover:text-white transition-colors">
                  Nhân vật lịch sử
                </Link>
              </li>
              <li>
                <Link href="/#historical-sites" className="text-gray-400 hover:text-white transition-colors">
                  Di tích lịch sử
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <p className="text-gray-400">Email: contact@lichsuviet.edu.vn</p>
            <p className="text-gray-400">Điện thoại: (84) 123 456 789</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="material-icons">email</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
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
  );
};

export default Footer;
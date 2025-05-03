import { useState } from 'react';
import { Link } from 'wouter';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your API
      setIsSubscribed(true);
      setEmail('');
      
      // Reset subscription status after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };
  
  return (
    <footer id="about" className="bg-[hsl(var(--foreground))] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl mb-4 text-[hsl(var(--secondary))]">
              Lịch Sử Việt Nam
            </h3>
            <p className="mb-4">
              Trang thông tin lịch sử Việt Nam từ thời Vua Hùng dựng nước đến thời hiện đại, 
              giúp bạn khám phá hành trình 4000 năm dựng nước và giữ nước của dân tộc.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-white hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                <span className="material-icons">email</span>
              </a>
              <a href="#" className="text-white hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                <span className="material-icons">share</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl mb-4 text-[hsl(var(--secondary))]">
              Liên Kết
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#overview">
                  <a className="hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                    Trang Chủ
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#timeline">
                  <a className="hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                    Dòng Thời Gian
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#figures">
                  <a className="hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                    Nhân Vật Lịch Sử
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#about">
                  <a className="hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                    Giới Thiệu
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl mb-4 text-[hsl(var(--secondary))]">
              Đăng Ký Nhận Tin
            </h3>
            <p className="mb-4">Đăng ký để nhận thông tin mới nhất về lịch sử Việt Nam.</p>
            <div className="mt-4">
              <form onSubmit={handleSubscribe}>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    className="px-4 py-2 rounded-l-md w-full focus:outline-none text-[hsl(var(--foreground))]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors duration-300"
                  >
                    <span className="material-icons">send</span>
                  </button>
                </div>
              </form>
              
              {isSubscribed && (
                <p className="text-green-400 mt-2">Đăng ký thành công!</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Lịch Sử Việt Nam. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

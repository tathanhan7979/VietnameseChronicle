import { useState } from 'react';
import { Link } from 'wouter';
import { Facebook, Mail, Share, Send, Clock10Icon, UserIcon, LandmarkIcon, BookOpenIcon } from 'lucide-react';

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
  
  const handleLinkClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <footer id="about" className="bg-[#1A237E] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-[#C62828] rounded-full flex items-center justify-center text-white font-bold font-['Playfair_Display'] text-lg">
                VN
              </div>
              <h3 className="font-['Playfair_Display'] font-bold text-xl text-white">
                Lịch Sử Việt Nam
              </h3>
            </div>
            <p className="mb-4 text-gray-200">
              Trang thông tin lịch sử Việt Nam từ thời Vua Hùng dựng nước đến thời hiện đại, 
              giúp bạn khám phá hành trình 4000 năm dựng nước và giữ nước của dân tộc.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white hover:text-[#FF8A80] transition-colors duration-300 bg-white/10 p-2 rounded-full">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#FF8A80] transition-colors duration-300 bg-white/10 p-2 rounded-full">
                <Mail size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#FF8A80] transition-colors duration-300 bg-white/10 p-2 rounded-full">
                <Share size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl mb-6 text-white">
              Khám Phá Website
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => handleLinkClick('home', e)}
                  className="flex items-center text-gray-200 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Trang Chủ
                </a>
              </li>
              <li>
                <a 
                  href="#timeline" 
                  onClick={(e) => handleLinkClick('timeline', e)}
                  className="flex items-center text-gray-200 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                >
                  <Clock10Icon className="h-4 w-4 mr-2" />
                  Dòng Thời Gian
                </a>
              </li>
              <li>
                <a 
                  href="#historical-figures" 
                  onClick={(e) => handleLinkClick('historical-figures', e)}
                  className="flex items-center text-gray-200 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Nhân Vật Lịch Sử
                </a>
              </li>
              <li>
                <a 
                  href="#historical-sites" 
                  onClick={(e) => handleLinkClick('historical-sites', e)}
                  className="flex items-center text-gray-200 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                >
                  <LandmarkIcon className="h-4 w-4 mr-2" />
                  Di Tích Lịch Sử
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl mb-6 text-white">
              Đăng Ký Nhận Tin
            </h3>
            <p className="mb-4 text-gray-200">Đăng ký để nhận thông tin mới nhất về lịch sử Việt Nam.</p>
            <div className="mt-4">
              <form onSubmit={handleSubscribe}>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    className="px-4 py-3 rounded-l-md w-full focus:outline-none text-gray-800 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-[#C62828] text-white px-4 py-3 rounded-r-md hover:bg-[#B71C1C] transition-colors duration-300"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
              
              {isSubscribed && (
                <p className="text-green-400 mt-2 text-sm">Đăng ký thành công!</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-900 mt-10 pt-6 text-center text-sm text-indigo-200 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Lịch Sử Việt Nam. Tất cả các quyền được bảo lưu.</p>
          <div className="mt-2 md:mt-0 space-x-4">
            <a href="#" className="text-indigo-200 hover:text-white">Chính sách bảo mật</a>
            <span className="text-indigo-900">|</span>
            <a href="#" className="text-indigo-200 hover:text-white">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

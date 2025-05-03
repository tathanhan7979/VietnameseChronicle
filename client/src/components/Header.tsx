import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Clock10Icon, UserIcon, LandmarkIcon, HomeIcon, BookOpenIcon, SearchIcon, MenuIcon, XIcon } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onOpenSearch: () => void;
  activeSection?: string;
  onSectionSelect?: (sectionId: string) => void;
}

export default function Header({ onOpenSearch, activeSection = '', onSectionSelect }: HeaderProps) {
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    { id: 'home', name: 'Trang Chủ', icon: HomeIcon, href: '/' },
    { id: 'timeline', name: 'Dòng Thời Gian', icon: Clock10Icon, href: '/#timeline' },
    { id: 'historical-figures', name: 'Nhân Vật Lịch Sử', icon: UserIcon, href: '/#historical-figures' },
    { id: 'historical-sites', name: 'Di Tích Lịch Sử', icon: LandmarkIcon, href: '/#historical-sites' },
    { id: 'about', name: 'Giới Thiệu', icon: BookOpenIcon, href: '/#about' },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle navigation click
  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    // Only handle for homepage sections
    if (sectionId !== 'home' && onSectionSelect) {
      e.preventDefault();
      onSectionSelect(sectionId);
    }

    // Close mobile menu when clicking a navigation item
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };
  
  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="h-10 w-10 mr-3 bg-[#C62828] rounded-full flex items-center justify-center text-white font-bold font-['Playfair_Display'] text-lg">
                VN
              </div>
              <h1 className="font-['Playfair_Display'] font-bold text-xl md:text-2xl text-[#C62828] tracking-wider">
                LỊCH SỬ VIỆT NAM
              </h1>
            </div>
          </Link>
          
          {/* Mobile Menu Icon */}
          {isMobile && (
            <div className="flex items-center">
              <button
                onClick={onOpenSearch}
                className="p-2 mr-2 text-gray-600 hover:text-[#C62828] transition-colors"
                aria-label="Tìm kiếm"
              >
                <SearchIcon className="h-6 w-6" />
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-[#C62828] transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          )}
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.href}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors hover:bg-red-50 hover:text-[#C62828] ${activeSection === item.id ? 'text-[#C62828] bg-red-50' : 'text-gray-700'}`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={onOpenSearch}
                className="flex items-center px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-[#C62828] transition-colors cursor-pointer ml-2"
                aria-label="Tìm kiếm"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Tìm Kiếm
              </button>
            </nav>
          )}
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobile && isMobileMenuOpen && (
          <nav className="mt-4 py-4 border-t border-gray-200">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={item.href}
                    onClick={(e) => handleNavClick(item.id, e)}
                    className={`flex items-center py-2 px-3 rounded-md font-medium hover:bg-red-50 hover:text-[#C62828] transition-colors ${activeSection === item.id ? 'text-[#C62828] bg-red-50' : 'text-gray-700'}`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

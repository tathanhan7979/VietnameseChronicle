import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchOverlay from './SearchOverlay';

interface HeaderProps {
  activeSection?: string;
  onSectionSelect?: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onSectionSelect }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    closeMobileMenu();
    if (onSectionSelect) {
      onSectionSelect(sectionId);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md text-gray-800' : 'bg-transparent text-white'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <Link href="/" className="font-bold text-xl md:text-2xl">
                Lịch Sử Việt Nam
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {isHomePage ? (
                <>
                  <a 
                    href="#timeline" 
                    onClick={() => handleSectionClick('timeline')}
                    className={`hover:text-red-500 transition-colors ${
                      activeSection === 'timeline' ? 'font-semibold text-red-500' : ''
                    }`}
                  >
                    Dòng thời gian
                  </a>
                  <a 
                    href="#historical-figures" 
                    onClick={() => handleSectionClick('historical-figures')}
                    className={`hover:text-red-500 transition-colors ${
                      activeSection === 'historical-figures' ? 'font-semibold text-red-500' : ''
                    }`}
                  >
                    Nhân vật
                  </a>
                  <a 
                    href="#historical-sites" 
                    onClick={() => handleSectionClick('historical-sites')}
                    className={`hover:text-red-500 transition-colors ${
                      activeSection === 'historical-sites' ? 'font-semibold text-red-500' : ''
                    }`}
                  >
                    Di tích
                  </a>
                </>
              ) : (
                <>
                  <Link 
                    href="/#timeline" 
                    className="hover:text-red-500 transition-colors"
                  >
                    Dòng thời gian
                  </Link>
                  <Link 
                    href="/#historical-figures" 
                    className="hover:text-red-500 transition-colors"
                  >
                    Nhân vật
                  </Link>
                  <Link 
                    href="/#historical-sites" 
                    className="hover:text-red-500 transition-colors"
                  >
                    Di tích
                  </Link>
                </>
              )}
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:text-red-500 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Tìm kiếm
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden space-x-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button onClick={toggleMobileMenu} className="p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white text-gray-800 transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? 'max-h-screen opacity-100 shadow-md' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {isHomePage ? (
                <>
                  <li>
                    <a 
                      href="#timeline" 
                      onClick={() => handleSectionClick('timeline')}
                      className={`block py-2 hover:text-red-500 transition-colors ${
                        activeSection === 'timeline' ? 'font-semibold text-red-500' : ''
                      }`}
                    >
                      Dòng thời gian
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#historical-figures" 
                      onClick={() => handleSectionClick('historical-figures')}
                      className={`block py-2 hover:text-red-500 transition-colors ${
                        activeSection === 'historical-figures' ? 'font-semibold text-red-500' : ''
                      }`}
                    >
                      Nhân vật lịch sử
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#historical-sites" 
                      onClick={() => handleSectionClick('historical-sites')}
                      className={`block py-2 hover:text-red-500 transition-colors ${
                        activeSection === 'historical-sites' ? 'font-semibold text-red-500' : ''
                      }`}
                    >
                      Di tích lịch sử
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/#timeline"
                      className="block py-2 hover:text-red-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Dòng thời gian
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/#historical-figures"
                      className="block py-2 hover:text-red-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Nhân vật lịch sử
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/#historical-sites"
                      className="block py-2 hover:text-red-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Di tích lịch sử
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Header;
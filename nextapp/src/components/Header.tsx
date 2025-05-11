import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface HeaderProps {
  onOpenSearch: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Xác định menu item active dựa trên path
  const isActive = (path: string) => {
    return router.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Đóng mobile menu khi chuyển trang
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="w-10 h-10 relative mr-3">
            <Image 
              src="/logo.png" 
              alt="Lịch Sử Việt Nam Logo" 
              className="object-contain" 
              fill
              sizes="40px"
              priority
            />
          </div>
          <span className={`text-xl font-bold ${
            scrolled ? 'text-primary dark:text-white' : 'text-white'
          }`}>
            Lịch Sử Việt Nam
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/"
            className={`${
              isActive('/') && router.pathname === '/' 
                ? 'text-primary dark:text-primary' 
                : scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Trang Chủ
          </Link>
          <Link 
            href="/thoi-ky"
            className={`${
              isActive('/thoi-ky') 
                ? 'text-primary dark:text-primary' 
                : scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Thời Kỳ
          </Link>
          <Link 
            href="/su-kien"
            className={`${
              isActive('/su-kien') 
                ? 'text-primary dark:text-primary' 
                : scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Sự Kiện
          </Link>
          <Link 
            href="/nhan-vat"
            className={`${
              isActive('/nhan-vat') 
                ? 'text-primary dark:text-primary' 
                : scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Nhân Vật
          </Link>
          <Link 
            href="/di-tich"
            className={`${
              isActive('/di-tich') 
                ? 'text-primary dark:text-primary' 
                : scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Di Tích
          </Link>
          <button
            onClick={onOpenSearch}
            className={`${
              scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary focus:outline-none transition-colors`}
            aria-label="Tìm kiếm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <button
            onClick={onOpenSearch}
            className={`${
              scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary focus:outline-none transition-colors`}
            aria-label="Tìm kiếm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${
              scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
            } hover:text-primary dark:hover:text-primary focus:outline-none transition-colors`}
            aria-label="Mở menu"
          >
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

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-64' : 'max-h-0'
        } bg-white dark:bg-gray-900 shadow-md`}
      >
        <nav className="flex flex-col space-y-4 px-4 py-4">
          <Link 
            href="/"
            className={`${
              isActive('/') && router.pathname === '/' 
                ? 'text-primary dark:text-primary' 
                : 'text-gray-700 dark:text-gray-200'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Trang Chủ
          </Link>
          <Link 
            href="/thoi-ky"
            className={`${
              isActive('/thoi-ky') 
                ? 'text-primary dark:text-primary' 
                : 'text-gray-700 dark:text-gray-200'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Thời Kỳ
          </Link>
          <Link 
            href="/su-kien"
            className={`${
              isActive('/su-kien') 
                ? 'text-primary dark:text-primary' 
                : 'text-gray-700 dark:text-gray-200'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Sự Kiện
          </Link>
          <Link 
            href="/nhan-vat"
            className={`${
              isActive('/nhan-vat') 
                ? 'text-primary dark:text-primary' 
                : 'text-gray-700 dark:text-gray-200'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Nhân Vật
          </Link>
          <Link 
            href="/di-tich"
            className={`${
              isActive('/di-tich') 
                ? 'text-primary dark:text-primary' 
                : 'text-gray-700 dark:text-gray-200'
            } hover:text-primary dark:hover:text-primary font-medium`}
          >
            Di Tích
          </Link>
        </nav>
      </div>
    </header>
  );
}
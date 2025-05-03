import { useState, useCallback } from 'react';
import { Link } from 'wouter';

interface HeaderProps {
  onOpenSearch: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  const toggleLanguageDropdown = useCallback(() => {
    setIsLanguageDropdownOpen(prev => !prev);
  }, []);
  
  return (
    <header className="fixed top-0 w-full bg-[hsl(var(--background))] bg-opacity-90 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg
            className="h-10 w-10 mr-3 rounded-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="hsl(var(--primary))"/>
            <text
              x="50"
              y="50"
              fontSize="50"
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="hsl(var(--secondary))"
            >
              VN
            </text>
          </svg>
          <h1 className="font-['Playfair_Display'] font-bold text-xl md:text-2xl text-[hsl(var(--primary))]">
            LỊCH SỬ VIỆT NAM
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#overview">
            <a className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
              Tổng Quan
            </a>
          </Link>
          <Link href="#timeline">
            <a className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
              Dòng Thời Gian
            </a>
          </Link>
          <Link href="#figures">
            <a className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
              Nhân Vật
            </a>
          </Link>
          <Link href="#about">
            <a className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
              Giới Thiệu
            </a>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onOpenSearch}
            className="rounded-full p-2 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">search</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleLanguageDropdown}
              className="flex items-center space-x-1 rounded-full py-1 px-3 border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors duration-300"
            >
              <span>VI</span>
              <span className="material-icons text-sm">keyboard_arrow_down</span>
            </button>
            
            {isLanguageDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md py-2 w-24">
                <a href="#" className="block px-4 py-2 hover:bg-[hsl(var(--background))] transition-colors duration-300 text-[hsl(var(--primary))] font-bold">
                  Tiếng Việt
                </a>
                <a href="#" className="block px-4 py-2 hover:bg-[hsl(var(--background))] transition-colors duration-300">
                  English
                </a>
              </div>
            )}
          </div>
          
          <button 
            onClick={toggleMenu}
            className="md:hidden rounded-full p-2 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-[hsl(var(--background))] w-full">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <a href="#overview" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Tổng Quan
            </a>
            <a href="#timeline" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Dòng Thời Gian
            </a>
            <a href="#figures" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Nhân Vật
            </a>
            <a href="#about" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2">
              Giới Thiệu
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

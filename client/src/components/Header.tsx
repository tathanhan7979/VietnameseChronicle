import { useState, useCallback } from 'react';
import { Link } from 'wouter';

interface HeaderProps {
  onOpenSearch: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
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
          <a href="/#overview" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
            Tổng Quan
          </a>
          <a href="/#timeline" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
            Dòng Thời Gian
          </a>
          <a href="/#figures" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
            Nhân Vật
          </a>
          <a href="/#about" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300">
            Giới Thiệu
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onOpenSearch}
            className="rounded-full p-2 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">search</span>
          </button>
          
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
            <a href="/#overview" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Tổng Quan
            </a>
            <a href="/#timeline" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Dòng Thời Gian
            </a>
            <a href="/#figures" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2 border-b border-gray-200">
              Nhân Vật
            </a>
            <a href="/#about" className="font-['Montserrat'] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300 py-2">
              Giới Thiệu
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

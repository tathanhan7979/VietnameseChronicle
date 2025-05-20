import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Show button when user scrolls down 300px
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  
  // Set scroll event listener with passive option for better performance
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`fixed md:bottom-8 md:right-8 bottom-4 right-4 p-3 rounded-full bg-[#4527A0] text-white shadow-lg transition-all duration-300 hover:bg-[#C62828] hover:scale-110 z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      aria-label="Lên đầu trang"
    >
      <ArrowUp className="w-5 h-5" />
      {showTooltip && (
        <span className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity duration-200">
          Lên đầu trang
        </span>
      )}
    </button>
  );
}

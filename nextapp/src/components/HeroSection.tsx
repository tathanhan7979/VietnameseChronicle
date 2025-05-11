import { FC } from 'react';
import Image from 'next/image';
import { DEFAULT_SEO_IMAGE } from '../lib/constants';

interface HeroSectionProps {
  onStartExplore?: () => void;
  backgroundImage?: string;
}

const HeroSection: FC<HeroSectionProps> = ({ 
  onStartExplore,
  backgroundImage = DEFAULT_SEO_IMAGE 
}) => {
  return (
    <section className="hero-section">
      <div 
        className="hero-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Khám Phá Lịch Sử Việt Nam
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow">
          Hành trình hàng ngàn năm dựng nước và giữ nước của dân tộc Việt Nam
        </p>
        <button
          onClick={onStartExplore}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-lg"
        >
          Khám Phá Lịch Sử
        </button>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center animate-bounce">
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <span className="text-sm mt-1">Cuộn xuống</span>
      </div>
    </section>
  );
};

export default HeroSection;
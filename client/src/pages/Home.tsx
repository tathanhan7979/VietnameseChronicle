import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TimelineSection from '@/components/TimelineSection';
import HistoricalFiguresSection from '@/components/HistoricalFiguresSection';
import SearchOverlay from '@/components/SearchOverlay';
import Footer from '@/components/Footer';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const openSearch = () => {
    setIsSearchOpen(true);
  };
  
  const closeSearch = () => {
    setIsSearchOpen(false);
  };
  
  return (
    <div className="min-h-screen">
      <Header onOpenSearch={openSearch} />
      <HeroSection />
      <TimelineSection />
      <HistoricalFiguresSection />
      <Footer />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={closeSearch} 
      />
    </div>
  );
}

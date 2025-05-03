import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TimelineSection from '@/components/TimelineSection';
import HistoricalFiguresSection from '@/components/HistoricalFiguresSection';
import HistoricalSitesSection from '@/components/HistoricalSitesSection';
import SearchOverlay from '@/components/SearchOverlay';
import Footer from '@/components/Footer';
import { PeriodData, EventData } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('timeline');
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  
  // Fetch data
  const { data: periods } = useQuery<PeriodData[]>({
    queryKey: ['/api/periods'],
  });

  const { data: events } = useQuery<EventData[]>({
    queryKey: ['/api/events'],
  });
  
  const openSearch = () => {
    setIsSearchOpen(true);
  };
  
  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle period selection
  const handlePeriodSelect = (periodSlug: string) => {
    setActivePeriod(periodSlug);
    
    // Scroll to period
    const element = document.getElementById(`period-${periodSlug}`);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header onOpenSearch={openSearch} activeSection={activeSection} onSectionSelect={scrollToSection} />
      <HeroSection onStartExplore={() => scrollToSection('timeline')} />
      <TimelineSection 
        periods={periods || []} 
        events={events || []} 
        activePeriodSlug={activePeriod} 
        onPeriodSelect={handlePeriodSelect} 
      />
      <HistoricalFiguresSection />
      <HistoricalSitesSection />
      <Footer />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={closeSearch} 
      />
    </div>
  );
}

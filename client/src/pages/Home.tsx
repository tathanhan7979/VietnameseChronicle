import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TimelineSection from '@/components/TimelineSection';
import HistoricalFiguresSection from '@/components/HistoricalFiguresSection';
import HistoricalSitesSection from '@/components/HistoricalSitesSection';
import SearchOverlay from '@/components/SearchOverlay';
import Footer from '@/components/Footer';
import { PeriodData, EventData, HistoricalFigure, HistoricalSite } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  
  // Fetch all data
  const { data: periods } = useQuery<PeriodData[]>({
    queryKey: ['/api/periods'],
  });

  const { data: events } = useQuery<EventData[]>({
    queryKey: ['/api/events'],
  });
  
  const { data: figures } = useQuery<HistoricalFigure[]>({
    queryKey: ['/api/historical-figures'],
  });

  const { data: sites } = useQuery<HistoricalSite[]>({
    queryKey: ['/api/historical-sites'],
  });
  
  // Handle section visibility based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      const sections = ['home', 'timeline', 'historical-figures', 'historical-sites'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
      const offsetPosition = elementPosition + window.scrollY - offset;
      
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
      const offset = 100; // Header height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header onOpenSearch={openSearch} activeSection={activeSection} onSectionSelect={scrollToSection} />
      <HeroSection onStartExplore={() => scrollToSection('timeline')} />
      <TimelineSection 
        periods={periods || []} 
        events={events || []} 
        activePeriodSlug={activePeriod} 
        onPeriodSelect={handlePeriodSelect} 
      />
      <HistoricalFiguresSection figures={figures} />
      <HistoricalSitesSection sites={sites} />
      <Footer />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={closeSearch} 
      />
    </div>
  );
}

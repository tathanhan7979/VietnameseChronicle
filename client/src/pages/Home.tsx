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
import BackToTop from '@/components/BackToTop';

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
  
  // Xử lý tham số period trong URL khi trang được tải
  useEffect(() => {
    // Lấy tham số period từ URL query string
    const queryParams = new URLSearchParams(window.location.search);
    const periodParam = queryParams.get('period');
    
    if (periodParam) {
      // Nếu có tham số period, thiết lập active period và cuộn đến vị trí
      setActivePeriod(periodParam);
      setActiveSection('timeline');
      
      // Đợi sau 500ms để đảm bảo trang đã render xong
      setTimeout(() => {
        const timelineElement = document.getElementById('timeline');
        if (timelineElement) {
          // Cuộn đến timeline trước
          const offset = 80; // Header height
          const elementPosition = timelineElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Sau đó đợi thêm 500ms để cuộn đến period cụ thể
          setTimeout(() => {
            handlePeriodSelect(periodParam);
          }, 500);
        }
      }, 500);
    }
  }, []);
  
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
      <BackToTop />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={closeSearch} 
      />
    </div>
  );
}

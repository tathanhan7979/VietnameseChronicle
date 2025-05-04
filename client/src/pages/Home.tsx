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
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import BackToTop from '@/components/BackToTop';

// Component for the Featured Periods section
function FeaturedPeriodsSection({ periods }: { periods?: PeriodData[] }) {
  // Some key notable periods to highlight
  const featuredPeriodSlugs = ['hung-vuong', 'tran', 'le', 'nguyen', 'vietnam-hien-dai'];
  const featuredPeriods = periods?.filter(period => 
    featuredPeriodSlugs.includes(period.slug)
  ) || [];

  // Background images for featured periods
  const periodImages = {
    'hung-vuong': 'https://images.unsplash.com/photo-1694940635471-83c1e6fa83f3?q=80&w=1854&auto=format&fit=crop',
    'tran': 'https://images.unsplash.com/photo-1583417319588-4dbde2e0a2d5?q=80&w=2070&auto=format&fit=crop',
    'le': 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?q=80&w=1974&auto=format&fit=crop',
    'nguyen': 'https://images.unsplash.com/photo-1602163816954-9bdf1f7a8552?q=80&w=1932&auto=format&fit=crop',
    'vietnam-hien-dai': 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?q=80&w=2070&auto=format&fit=crop'
  };
  
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="featured-periods" className="py-20 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Triều Đại Nổi Bật
          </motion.h2>
          <motion.div 
            className="w-20 h-1 bg-[#C62828] mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.div>
          <motion.p 
            className="text-gray-600 mt-6 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Khám phá các triều đại quan trọng đã định hình lịch sử Việt Nam qua hàng nghìn năm
          </motion.p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuredPeriods.map((period) => (
            <motion.div 
              key={period.id}
              variants={itemVariants}
            >
              <Link to={`/thoi-ky/${period.id}/${period.slug}`}>
                <div className="relative rounded-xl overflow-hidden shadow-lg group h-80 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10 group-hover:opacity-90 transition-opacity"></div>
                  <img 
                    src={periodImages[period.slug as keyof typeof periodImages] || 'https://images.unsplash.com/photo-1583417319588-4dbde2e0a2d5?q=80&w=2070&auto=format&fit=crop'} 
                    alt={period.name} 
                    className="absolute inset-0 h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <span className="bg-[#C62828] rounded-full px-3 py-1 text-sm text-white font-medium mb-3 inline-block">
                      {period.timeframe}
                    </span>
                    <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-2 group-hover:text-[#F44336] transition-colors">
                      {period.name}
                    </h3>
                    <p className="text-gray-200 mb-4 line-clamp-2">
                      {period.description}
                    </p>
                    <span className="text-white font-medium group-hover:text-[#F44336] flex items-center transition-colors">
                      Khám phá triều đại
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
      const sections = ['home', 'timeline', 'featured-periods', 'historical-figures', 'historical-sites'];
      
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
      <FeaturedPeriodsSection periods={periods} />
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

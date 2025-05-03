import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { slugify } from '@/lib/utils';
import { PeriodData, EventData } from '@/lib/types';
import '../styles/timeline.css';

interface TimelineSectionProps {
  periods: PeriodData[];
  events: EventData[];
  activePeriodSlug?: string | null;
  onPeriodSelect?: (periodSlug: string) => void;
}

export default function TimelineSection({ 
  periods = [], 
  events = [], 
  activePeriodSlug = null,
  onPeriodSelect 
}: TimelineSectionProps) {
  const [activeSection, setActiveSection] = useState<string | null>(activePeriodSlug);
  
  // Set active period from props
  useEffect(() => {
    if (activePeriodSlug) {
      setActiveSection(activePeriodSlug);
    }
  }, [activePeriodSlug]);
  
  // Add auto detection for active section
  useEffect(() => {
    const handleScroll = () => {
      // Find all period sections
      const periodSections = document.querySelectorAll('.period-section');
      if (!periodSections.length) return;
      
      // Determine which one is in view
      const scrollPosition = window.scrollY + 200; // 200px offset for better detection
      
      // Convert NodeList to Array for easier manipulation
      Array.from(periodSections).forEach((section) => {
        const periodId = section.id;
        const slug = periodId.replace('period-', '');
        const { top, bottom } = section.getBoundingClientRect();
        const elementTop = top + window.scrollY;
        const elementBottom = bottom + window.scrollY;
        
        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          setActiveSection(slug);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Run once on mount to set initial active period
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle period click
  const handlePeriodClick = (slug: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveSection(slug);
    
    // Notify parent component
    if (onPeriodSelect) {
      onPeriodSelect(slug);
    }
    
    // Scroll to element
    const element = document.getElementById(`period-${slug}`);
    if (element) {
      const offset = 100; // Header height + some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Loading state
  if (periods.length === 0 || events.length === 0) {
    return (
      <section id="timeline" className="bg-[#FDFAF3] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828] mb-16">
            Đang tải dữ liệu lịch sử...
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="bg-[#FDFAF3] py-16">
      <div className="container mx-auto px-4">
        <div className="timeline-header">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828]">
            Dòng Thời Gian <span className="text-[#D4AF37]">Lịch Sử Việt Nam</span>
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Time Period Navigation - Left sidebar */}
          <div className="md:w-1/4 mb-8 md:mb-0">
            <div className="sticky top-24">
              <h3 className="font-['Playfair_Display'] font-bold text-xl mb-6 text-[#C62828]">
                Các Thời Kỳ
              </h3>
              <ul className="period-nav">
                {periods.map((period) => (
                  <li 
                    key={period.id}
                    className={activeSection === period.slug ? 'active' : ''}
                  >
                    <a 
                      href={`#period-${period.slug}`} 
                      onClick={(e) => handlePeriodClick(period.slug, e)}
                    >
                      {period.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Timeline Content with Vertical Line */}
          <div className="md:w-3/4 timeline-vertical">
            {periods.map((period, periodIndex) => {
              const periodEvents = events.filter(event => event.periodId === period.id);
              
              return (
                <div id={`period-${period.slug}`} key={period.id} className="mb-24 relative period-section">
                  {/* Period marker */}
                  <div className="period-marker">
                    <span className="text-xs">{periodIndex + 1}</span>
                  </div>
                  
                  {/* Period header */}
                  <div className="text-center mb-16">
                    <h3 className="font-['Playfair_Display'] font-bold text-2xl md:text-3xl text-[#C62828]">
                      {period.name} <span className="text-[#D4AF37]">({period.timeframe})</span>
                    </h3>
                  </div>
                  
                  {/* Timeline events */}
                  <div>
                    {periodEvents.map((event, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5 }}
                          className={`mb-16 ${isEven ? 'event-left' : 'event-right'}`}
                        >
                          {/* Timeline dot */}
                          <div className="timeline-dot" style={{ top: '20px' }}></div>
                          
                          <div className="event-card p-4 md:p-6">
                            <div className={`flex flex-col ${isEven ? 'items-end' : 'items-start'} mb-3`}>
                              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`} className="block">
                                <h4 className="font-['Playfair_Display'] font-bold text-xl text-[#4527A0] hover:text-[#C62828] transition-colors">
                                  {event.title}
                                </h4>
                              </Link>
                              <span className="text-gray-500 text-sm mt-1">{event.year}</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                            
                            {event.imageUrl && (
                              <div className="mb-4">
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title} 
                                  className="w-full h-40 object-cover rounded-md"
                                />
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1">
                                {event.eventTypes && event.eventTypes.map(type => (
                                  <span 
                                    key={type.id}
                                    className="inline-block text-white px-2 py-1 rounded-full text-xs"
                                    style={{ backgroundColor: type.color || '#C62828' }}
                                  >
                                    {type.name}
                                  </span>
                                ))}
                              </div>
                              
                              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                                <button className="text-[#C62828] text-sm hover:underline px-4 py-1">
                                  Xem chi tiết
                                </button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
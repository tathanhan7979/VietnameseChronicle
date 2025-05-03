import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Clock10Icon } from 'lucide-react';
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
  
  // Handle period click
  const handlePeriodClick = (slug: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveSection(slug);
    
    // Notify parent component
    if (onPeriodSelect) {
      onPeriodSelect(slug);
    } else {
      // Scroll to element if no parent handler
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
        <div className="text-center mb-16">
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
                    className={`border-l-2 ${activeSection === period.slug ? 'border-[#C62828] bg-red-50' : 'border-gray-200'} mb-1`}
                  >
                    <a 
                      href={`#period-${period.slug}`} 
                      onClick={(e) => handlePeriodClick(period.slug, e)}
                      className={`block py-2 px-4 hover:bg-red-50 transition-all duration-300 ${activeSection === period.slug ? 'text-[#C62828] font-medium' : 'text-gray-700'}`}
                    >
                      {period.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Center Timeline */}
          <div className="hidden md:block md:w-12 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#C62828] transform -translate-x-1/2"></div>
            
            {periods.map((period, index) => (
              <div 
                key={period.id} 
                className="absolute w-6 h-6 bg-[#C62828] rounded-full left-1/2 transform -translate-x-1/2 z-10"
                style={{ top: `${index * 400 + 150}px` }} // Adjust positioning
              ></div>
            ))}
          </div>
          
          {/* Timeline Content - Right side */}
          <div className="md:w-3/4">
            {periods.map((period, periodIndex) => {
              const periodEvents = events.filter(event => event.periodId === period.id);
              
              return (
                <div id={`period-${period.slug}`} key={period.id} className="mb-24 relative">
                  <div className="text-center mb-8 md:mb-16">
                    <h3 className="font-['Playfair_Display'] font-bold text-2xl md:text-3xl text-[#C62828]">
                      {period.name} <span className="text-[#D4AF37]">({period.timeframe})</span>
                    </h3>
                  </div>
                  
                  {/* Timeline events */}
                  <div className="space-y-16">
                    {periodEvents.map((event, index) => (
                      <motion.div 
                        className="timeline-event relative"
                        key={event.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="md:w-1/2 md:float-left md:pr-8 md:clear-left">
                          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 event-card">
                            <div className="flex justify-between items-start mb-3">
                              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                                <h4 className="font-['Playfair_Display'] font-bold text-xl text-[#4527A0] hover:text-[#C62828] transition-colors">
                                  {event.title}
                                </h4>
                              </Link>
                              <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">{event.year}</span>
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
                                <button className="text-[#C62828] text-sm hover:underline">
                                  Xem chi tiết
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
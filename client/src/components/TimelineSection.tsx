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
      <section id="timeline" className="bg-white py-20">
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
    <section id="timeline" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828] inline-flex items-center justify-center gap-3">
            <Clock10Icon className="h-8 w-8" />
            Dòng Thời Gian <span className="text-[#4527A0]">Lịch Sử Việt Nam</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Khám phá dòng chảy lịch sử Việt Nam qua các thời kỳ từ thời Hùng Vương dựng nước đến thời kỳ hiện đại
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Time Period Navigation */}
          <div className="md:w-1/4 mb-8 md:mb-0 md:pr-8">
            <div className="sticky top-24">
              <h3 className="font-['Playfair_Display'] font-bold text-xl mb-6 text-[#C62828] border-b-2 border-[#4527A0] pb-2">
                Các Thời Kỳ
              </h3>
              <ul className="period-nav space-y-2">
                {periods.map((period) => (
                  <li 
                    key={period.id}
                    className={activeSection === period.slug ? 'active' : ''}
                  >
                    <a 
                      href={`#period-${period.slug}`} 
                      onClick={(e) => handlePeriodClick(period.slug, e)}
                      className="block py-2 px-4 transition-all duration-300"
                    >
                      {period.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Timeline Content */}
          <div className="md:w-3/4 timeline-content">
            {periods.map((period) => {
              const periodEvents = events.filter(event => event.periodId === period.id);
              
              return (
                <div id={`period-${period.slug}`} key={period.id} className="mb-16 relative">
                  <div className="period-header mb-12">
                    <h3 className="font-['Playfair_Display'] font-bold text-2xl md:text-3xl text-[#C62828] mb-2">
                      {period.name}
                    </h3>
                    <p className="text-gray-600">{period.timeframe}</p>
                  </div>
                  
                  {/* Timeline items for this period */}
                  <div className="space-y-8">
                    {periodEvents.map((event, index) => (
                      <motion.div 
                        className="timeline-item relative pl-8"
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                          <div className="flex justify-between">
                            <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                              <h4 className="font-['Playfair_Display'] font-bold text-xl text-[#4527A0] mb-3 hover:text-[#C62828] transition-colors">
                                {event.title}
                              </h4>
                            </Link>
                            <span className="text-gray-500 text-sm">{event.year}</span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{event.description}</p>
                          
                          {event.imageUrl && (
                            <div className="my-4">
                              <img 
                                src={event.imageUrl} 
                                alt={event.title} 
                                className="w-full h-48 object-cover rounded-md"
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <div className="flex flex-wrap gap-2">
                              {event.eventTypes && event.eventTypes.map(type => (
                                <span 
                                  key={type.id}
                                  className="inline-block text-white px-3 py-1 rounded-full text-sm"
                                  style={{ backgroundColor: type.color || '#C62828' }}
                                >
                                  {type.name}
                                </span>
                              ))}
                            </div>
                            
                            <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                              <div className="text-[#C62828] font-medium text-sm hover:underline cursor-pointer">
                                Xem chi tiết
                              </div>
                            </Link>
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
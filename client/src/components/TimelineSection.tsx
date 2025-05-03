import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { useQuery } from '@tanstack/react-query';
import { PeriodData, EventData } from '@/lib/types';
import { Link } from 'wouter';
import { slugify } from '@/lib/utils';

export default function TimelineSection() {
  const { data: periods, isLoading: isLoadingPeriods } = useQuery<PeriodData[]>({
    queryKey: ['/api/periods'],
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery<EventData[]>({
    queryKey: ['/api/events'],
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const activeIds = periods?.map(period => `period-${period.slug}`) || [];
  const activeIndex = useScrollSpy(activeIds, { threshold: 0.4 });
  
  useEffect(() => {
    if (activeIndex !== -1 && periods && periods[activeIndex]) {
      setActiveSection(periods[activeIndex].slug);
    }
  }, [activeIndex, periods]);
  
  // Xử lý cuộn đến thời kỳ từ localStorage
  useEffect(() => {
    const scrollToPeriod = localStorage.getItem('scrollToPeriod');
    if (scrollToPeriod && periods && periods.length > 0) {
      setTimeout(() => {
        const periodElement = document.getElementById(`period-${scrollToPeriod}`);
        if (periodElement) {
          periodElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Xoá giá trị đã sử dụng
          localStorage.removeItem('scrollToPeriod');
        }
      }, 500); // Đợi 500ms để đảm bảo trang đã render
    }
  }, [periods]);

  if (isLoadingPeriods || isLoadingEvents) {
    return (
      <section id="timeline" className="bg-[hsl(var(--background))] pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--primary))] mb-16">
            Đang tải dữ liệu lịch sử...
          </h2>
          {/* Loading state */}
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!periods || periods.length === 0 || !events || events.length === 0) {
    return (
      <section id="timeline" className="bg-[hsl(var(--background))] pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--primary))] mb-16">
            Không tìm thấy dữ liệu lịch sử
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="bg-[hsl(var(--background))] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--primary))] text-center mb-16">
          Dòng Thời Gian <span className="text-[hsl(var(--secondary))]">Lịch Sử Việt Nam</span>
        </h2>
        
        <div className="flex flex-col md:flex-row">
          {/* Time Period Navigation */}
          <div className="md:w-1/4 mb-8 md:mb-0 md:pr-8">
            <div className="sticky top-24">
              <h3 className="font-['Playfair_Display'] font-bold text-xl mb-6 text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--secondary))] pb-2">
                Các Thời Kỳ
              </h3>
              <ul className="period-nav space-y-3">
                {periods.map((period) => (
                  <li 
                    key={period.id}
                    className={`pl-4 py-2 cursor-pointer transition-all duration-300 rounded-r-md ${activeSection === period.slug ? 'active' : ''}`}
                  >
                    <a href={`#period-${period.slug}`} className="block font-['Montserrat']">
                      {period.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Timeline Content */}
          <div className="md:w-3/4 timeline-vertical relative">
            {periods.map((period) => {
              const periodEvents = events.filter(event => event.periodId === period.id);
              
              return (
                <div id={`period-${period.slug}`} key={period.id} className="mb-24 pt-12">
                  <div className="era-marker" style={{ top: "0px" }}>
                    <span className="material-icons">{period.icon}</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-2xl md:text-3xl text-[hsl(var(--primary))] mb-12 pl-16 md:pl-0 md:text-center bg-[hsl(var(--background))] py-4 rounded-lg">
                    {period.name} ({period.timeframe})
                  </h3>
                  
                  {/* Timeline items for this period */}
                  {periodEvents.map((event, index) => (
                    <div className="timeline-item relative" key={event.id}>
                      <div className="timeline-dot"></div>
                      <motion.div 
                        className="timeline-content bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                          <h4 className="font-['Playfair_Display'] font-bold text-xl text-[hsl(var(--secondary))] mb-3 cursor-pointer hover:underline">
                            {event.title}
                          </h4>
                        </Link>
                        <p className="mb-4 line-clamp-3">{event.description}</p>
                        
                        {event.imageUrl && (
                          <div className="mt-4">
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="w-full h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex flex-wrap gap-2">
                            {event.eventTypes && event.eventTypes.map(type => (
                              <span 
                                key={type.id}
                                className="inline-block text-white px-3 py-1 rounded-full text-sm"
                                style={{ backgroundColor: type.color || '#ff5722' }}
                              >
                                {type.name}
                              </span>
                            ))}
                          </div>
                          <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                            <span className="text-[hsl(var(--secondary))] font-medium text-sm underline cursor-pointer hover:text-opacity-80">Xem chi tiết</span>
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

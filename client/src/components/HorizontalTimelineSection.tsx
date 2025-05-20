import { useState, useEffect } from "react";
import { Link } from "wouter";
import { slugify } from "@/lib/utils";
import { PeriodData, EventData } from "@/lib/types";
import "../styles/timeline.css";
import { ChevronRight } from "lucide-react";

interface HorizontalTimelineSectionProps {
  periods: PeriodData[];
  events: EventData[];
  activePeriodSlug?: string | null;
  onPeriodSelect?: (periodSlug: string) => void;
}

export default function HorizontalTimelineSection({
  periods = [],
  events = [],
  activePeriodSlug = null,
  onPeriodSelect,
}: HorizontalTimelineSectionProps) {
  const [activeSection, setActiveSection] = useState<string | null>(
    activePeriodSlug,
  );
  
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
    }

    // Scroll to element
    const element = document.getElementById(`period-h-${slug}`);
    if (element) {
      const offset = 100; // Header height + some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Loading state
  if (periods.length === 0 || events.length === 0) {
    return (
      <section id="timeline" className="timeline-container py-20">
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
    <div className="horizontal-timeline mt-8">
      {/* Timeline Top Bar - các thời kỳ */}
      <div className="timeline-years">
        {periods.map((period, index) => (
          <div 
            key={period.id}
            className={`timeline-year ${activeSection === period.slug ? 'active' : ''}`}
            onClick={(e) => {
              handlePeriodClick(period.slug, e);
            }}
          >
            <div className="timeline-year-circle">{index + 1}</div>
            <div className="timeline-year-text">
              {period.name}
              <span className="timeline-year-timeframe">{period.timeframe}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Timeline Events Container - hiển thị sự kiện của thời kỳ đang chọn */}
      {periods.map((period) => {
        const periodEvents = events.filter(event => event.periodId === period.id);
        const isActive = period.slug === activeSection;
        
        return (
          <div 
            key={period.id} 
            id={`period-h-${period.slug}`}
            className={`timeline-events-container ${isActive ? 'active' : ''}`}
          >
            <div className="timeline-events-header">
              <h2 className="timeline-events-title">
                <Link href={`/thoi-ky/${period.slug}`} className="hover:underline">
                  {period.name}
                </Link>
              </h2>
              <p className="timeline-events-subtitle">{period.timeframe} • {periodEvents.length} sự kiện</p>
            </div>
            
            {period.description && (
              <div className="mb-6 text-gray-700 timeline-period-description">
                {period.description.length > 200 
                  ? `${period.description.substring(0, 200)}...` 
                  : period.description}
              </div>
            )}
            
            {periodEvents.length > 0 ? (
              <>
                <div className="timeline-events-list">
                  {periodEvents.slice(0, 6).map((event) => (
                    <div key={event.id} className="timeline-event-card">
                      {event.imageUrl && (
                        <div className="timeline-event-image">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            onError={(e) => {
                              e.currentTarget.src = "/uploads/error-img.png";
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="timeline-event-content">
                        <div className="timeline-event-year">{event.year}</div>
                        
                        <h3 className="timeline-event-title">
                          <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                            {event.title}
                          </Link>
                        </h3>
                        
                        <p className="timeline-event-description">
                          {event.description}
                        </p>
                        
                        {event.eventTypes && event.eventTypes.length > 0 && (
                          <div className="timeline-event-tags">
                            {event.eventTypes.map((type) => (
                              <span
                                key={type.id}
                                className="timeline-event-tag"
                                style={{
                                  backgroundColor: type.color ? `${type.color}20` : '#f2f2f2',
                                  color: type.color || '#666',
                                }}
                              >
                                {type.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <Link 
                          href={`/su-kien/${event.id}/${slugify(event.title)}`}
                          className="timeline-event-link"
                        >
                          Xem chi tiết
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {periodEvents.length > 6 && (
                  <Link href={`/thoi-ky/${period.slug}`} className="timeline-see-more">
                    Xem tất cả {periodEvents.length} sự kiện
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Không có sự kiện nào trong thời kỳ này
              </div>
            )}
          </div>
        );
      })}
      
      {/* Timeline Navigation - nút điều hướng */}
      <div className="timeline-nav">
        <button 
          className="timeline-nav-button"
          onClick={(e) => {
            const currentIndex = periods.findIndex(p => p.slug === activeSection);
            if (currentIndex > 0) {
              handlePeriodClick(periods[currentIndex - 1].slug, e);
            }
          }}
          disabled={periods.findIndex(p => p.slug === activeSection) === 0}
        >
          ← Trước
        </button>
        
        <button 
          className="timeline-nav-button"
          onClick={(e) => {
            const currentIndex = periods.findIndex(p => p.slug === activeSection);
            if (currentIndex < periods.length - 1) {
              handlePeriodClick(periods[currentIndex + 1].slug, e);
            }
          }}
          disabled={periods.findIndex(p => p.slug === activeSection) === periods.length - 1}
        >
          Sau →
        </button>
      </div>
      
      {/* Timeline Instructions */}
      <div className="timeline-instructions">
        Nhấp vào các thời kỳ trên timeline để xem thông tin chi tiết. Sử dụng các nút điều hướng để di chuyển giữa các thời kỳ.
      </div>
    </div>
  );
}
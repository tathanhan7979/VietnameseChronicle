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
  
  // Lọc sự kiện theo thời kỳ đang chọn
  const activePeriod = periods.find(p => p.slug === activeSection) || periods[0];
  const activePeriodEvents = events.filter(event => event.periodId === activePeriod?.id);
  
  // Loading state
  if (periods.length === 0 || events.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 border-4 border-[#0095ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="horizontal-timeline-container mt-8">
      {/* Timeline thời kỳ */}
      <div className="period-selector mb-4 flex flex-wrap gap-2 justify-center">
        {periods.map((period, index) => (
          <button
            key={period.id}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeSection === period.slug
                ? "bg-[#0095ff] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => {
              setActiveSection(period.slug);
              if (onPeriodSelect) {
                onPeriodSelect(period.slug);
              }
            }}
          >
            {period.name}
          </button>
        ))}
      </div>
      
      {/* Timeline hiển thị các sự kiện xen kẽ trên/dưới */}
      <div className="alternating-timeline relative py-10 overflow-x-auto">
        {/* Đường timeline chính chạy ngang */}
        <div className="timeline-main-line absolute h-1 bg-[#0095ff] left-0 right-0 top-1/2 transform -translate-y-1/2"></div>
        
        <div className="timeline-events-wrapper flex flex-col relative min-w-max">
          {activePeriodEvents.length > 0 ? (
            <div className="timeline-events-row relative" style={{ minWidth: `${Math.max(activePeriodEvents.length * 300, 800)}px` }}>
              {activePeriodEvents.map((event, index) => {
                const isTop = index % 2 === 0;
                const eventPosition = `${(index / (activePeriodEvents.length - 1 || 1)) * 100}%`;
                
                return (
                  <div 
                    key={event.id}
                    className={`timeline-alt-event absolute ${isTop ? 'top-event' : 'bottom-event'}`}
                    style={{
                      left: activePeriodEvents.length > 1 ? eventPosition : '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {/* Card sự kiện */}
                    <div className={`timeline-alt-card ${isTop ? 'mb-10' : 'mt-10'} bg-white p-4 rounded-lg shadow-md w-64`}>
                      <h3 className="text-lg font-bold mb-2 text-[#333]">
                        <Link href={`/su-kien/${event.id}/${slugify(event.title)}`} className="hover:text-[#0095ff]">
                          {event.title}
                        </Link>
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-4">
                        {event.description}
                      </p>
                      
                      <Link
                        href={`/su-kien/${event.id}/${slugify(event.title)}`}
                        className="text-[#0095ff] text-sm font-medium flex items-center hover:underline"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    {/* Năm giữa timeline */}
                    <div className="year-bubble absolute bg-[#0095ff] text-white text-xs font-bold px-3 py-1 rounded-full z-10"
                      style={{
                        left: '50%',
                        top: isTop ? '100%' : '0',
                        transform: `translate(-50%, ${isTop ? '25%' : '-125%'})`
                      }}
                    >
                      {event.year}
                    </div>
                    
                    {/* Đường kết nối */}
                    <div className="connector-line absolute w-1 bg-[#0095ff]"
                      style={{
                        left: '50%',
                        top: isTop ? '100%' : '0',
                        height: '30px',
                        transform: 'translateX(-50%)',
                        [isTop ? 'bottom' : 'top']: 'auto'
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Không có sự kiện nào trong thời kỳ này
            </div>
          )}
        </div>
      </div>
      
      {/* Hiển thị thông tin thời kỳ được chọn */}
      {activePeriod && (
        <div className="period-info mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-[#0095ff] mb-2">
            <Link href={`/thoi-ky/${activePeriod.slug}`} className="hover:underline">
              {activePeriod.name} <span className="text-gray-500 font-normal">({activePeriod.timeframe})</span>
            </Link>
          </h2>
          
          {activePeriod.description && (
            <p className="text-gray-700 text-sm mb-2">
              {activePeriod.description.length > 200 
                ? `${activePeriod.description.substring(0, 200)}...` 
                : activePeriod.description}
            </p>
          )}
          
          <Link href={`/thoi-ky/${activePeriod.slug}`} className="text-[#0095ff] text-sm font-medium inline-flex items-center hover:underline">
            Xem tất cả {activePeriodEvents.length} sự kiện 
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
      
      {/* Nút điều hướng */}
      <div className="timeline-navigation flex justify-between mt-4">
        <button 
          className="nav-button px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={() => {
            const currentIndex = periods.findIndex(p => p.slug === activeSection);
            if (currentIndex > 0) {
              const prevPeriod = periods[currentIndex - 1];
              setActiveSection(prevPeriod.slug);
              if (onPeriodSelect) {
                onPeriodSelect(prevPeriod.slug);
              }
            }
          }}
          disabled={periods.findIndex(p => p.slug === activeSection) === 0}
        >
          ← Thời kỳ trước
        </button>
        
        <button 
          className="nav-button px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={() => {
            const currentIndex = periods.findIndex(p => p.slug === activeSection);
            if (currentIndex < periods.length - 1) {
              const nextPeriod = periods[currentIndex + 1];
              setActiveSection(nextPeriod.slug);
              if (onPeriodSelect) {
                onPeriodSelect(nextPeriod.slug);
              }
            }
          }}
          disabled={periods.findIndex(p => p.slug === activeSection) === periods.length - 1}
        >
          Thời kỳ sau →
        </button>
      </div>
    </div>
  );
}
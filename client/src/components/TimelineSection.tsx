import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { slugify } from "@/lib/utils";
import { PeriodData, EventData } from "@/lib/types";
import "../styles/timeline.css";
import { ChevronRight, Clock, History, CalendarDays, AlignVerticalJustifyCenter, Rows3 } from "lucide-react";

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
  onPeriodSelect,
}: TimelineSectionProps) {
  const [activeSection, setActiveSection] = useState<string | null>(
    activePeriodSlug,
  );
  const [layoutType, setLayoutType] = useState<"vertical" | "horizontal">(() => {
    // Lấy layout từ localStorage nếu có, mặc định là dọc (vertical)
    const savedLayout = localStorage.getItem("timelineLayout");
    return (savedLayout as "vertical" | "horizontal") || "vertical";
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  let globalCounter = 0;
  // Lấy tham số period từ URL khi quay lại trang chủ
  useEffect(() => {
    if (location.includes("?period=")) {
      // Tách lấy phần giữa ?period= và #
      let periodSlug;
      if (location.includes("#")) {
        periodSlug = location.split("?period=")[1].split("#")[0];
      } else {
        periodSlug = location.split("?period=")[1];
      }

      setActiveSection(periodSlug);

      // Cuộn đến thời kỳ đã chọn
      setTimeout(() => {
        const element = document.getElementById(`period-${periodSlug}`);
        if (element) {
          const offset = 100; // Header height + some padding
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 500);
    }
  }, [location]);

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
      const periodSections = document.querySelectorAll('[id^="period-"]');
      if (!periodSections.length) return;

      // Determine which one is in view
      const scrollPosition = window.scrollY + 200; // 200px offset for better detection

      // Convert NodeList to Array for easier manipulation
      Array.from(periodSections).forEach((section) => {
        const periodId = section.id;
        const slug = periodId.replace("period-", "");
        const { top, bottom } = section.getBoundingClientRect();
        const elementTop = top + window.scrollY;
        const elementBottom = bottom + window.scrollY;

        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          setActiveSection(slug);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    // Run once on mount to set initial active period
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
        behavior: "smooth",
      });
    }
  };

  // Handle layout toggle
  const toggleLayout = () => {
    const newLayout = layoutType === "vertical" ? "horizontal" : "vertical";
    setLayoutType(newLayout);
    localStorage.setItem("timelineLayout", newLayout);
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
    <section id="timeline" className="timeline-container py-16">
      <div className="container mx-auto px-4">
        <div className="timeline-heading">
          <h2 className="flex items-center justify-center gap-3 flex-nowrap">
            <History className="h-10 w-10 text-[#C62828]" />
            <span className="whitespace-mobile">
              Dòng Thời Gian{" "}
              <span className="custom-important-text">Lịch Sử Việt Nam</span>
            </span>
          </h2>
          <p>Khám phá dòng thời gian lịch sử 4000 năm của Việt Nam</p>
          <div className="flex justify-center mt-4">
            <div className="inline-flex bg-gray-100 rounded-lg p-1 shadow-sm">
              <button
                onClick={toggleLayout}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  layoutType === "vertical"
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                title="Dòng thời gian dọc"
              >
                <AlignVerticalJustifyCenter className="h-5 w-5" />
                <span className="hidden sm:inline">Dọc</span>
              </button>
              <button
                onClick={toggleLayout}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  layoutType === "horizontal"
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                title="Dòng thời gian ngang"
              >
                <Rows3 className="h-5 w-5" />
                <span className="hidden sm:inline">Ngang</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chọn layout hiển thị dựa vào state layoutType */}
        {layoutType === "vertical" ? (
          // BỐ CỤC DỌC (VERTICAL)
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left sidebar: Period navigation */}
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-xl font-bold mb-4 font-['Playfair_Display'] text-[#4527A0]">
                  CÁC THỜI KỲ
                </h3>
                <ul className="period-nav">
                  {periods.map((period) => (
                    <li
                      key={period.id}
                      className={activeSection === period.slug ? "active" : ""}
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

            {/* Right content: Timeline */}
            <div className="md:col-span-3 relative">
              {/* Main vertical timeline line */}
              <div className="timeline-line"></div>
              {periods.map((period, periodIndex) => {
                const periodEvents = events.filter(
                  (event) => event.periodId === period.id,
                );

                return (
                  <div
                    id={`period-${period.slug}`}
                    key={period.id}
                    className="mb-20"
                  >
                    {/* Period marker circle */}
                    <div className="period-marker">
                      <div className="period-marker-circle">
                        {periodIndex + 1}
                      </div>
                    </div>

                    {/* Period title */}
                    <div className="period-title">
                      <h3>
                        <Link
                          href={`/thoi-ky/${period.slug}`}
                          className="hover:underline hover:text-[hsl(var(--primary))]"
                        >
                          <div className="items-center gap-2 justify-center">
                            📅 {period.name} <span>({period.timeframe})</span>
                          </div>
                        </Link>
                      </h3>
                    </div>

                    {/* Events container */}
                    <div className="timeline-events-container">
                      {periodEvents.map((event, index) => {
                        const isLeft = globalCounter % 2 === 0;
                        globalCounter++; // Tăng sau khi dùng
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className={`timeline-event ${isLeft ? "left" : "right"}`}
                          >
                            {/* Event dot on the timeline */}
                            <div className="event-dot"></div>

                            {/* Event connector line */}
                            <div className="event-connector"></div>

                            {/* Event card */}
                            <div className="event-card">
                              <Link
                                href={`/su-kien/${event.id}/${slugify(event.title)}`}
                              >
                                <h4 className="event-title">{event.title}</h4>
                              </Link>

                              <span className="event-year">{event.year}</span>

                              <p className="event-description">
                                {event.description}
                              </p>

                              {event.imageUrl && (
                                <picture>
                                  <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="event-image"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/uploads/error-img.png";
                                    }}
                                  />
                                </picture>
                              )}

                              <div className="mt-4">
                                {event.eventTypes &&
                                  event.eventTypes.length > 0 && (
                                    <div className="event-tags mb-2">
                                      {event.eventTypes.map((type) => (
                                        <span
                                          key={type.id}
                                          className="event-tag"
                                          style={{
                                            backgroundColor:
                                              type.color || "#C62828",
                                          }}
                                        >
                                          {type.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                <Link
                                  href={`/su-kien/${event.id}/${slugify(event.title)}`}
                                >
                                  <div className="view-details">
                                    <span>Xem chi tiết</span>
                                    <ChevronRight className="h-5 w-5 transition-transform" />
                                  </div>
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
        ) : (
          // BỐ CỤC NGANG (HORIZONTAL) THEO THANH TRƯỢT
          <div className="mt-8">
            {/* Thanh điều hướng các thời kỳ */}
            <div className="mb-2 overflow-x-auto">
              <ul className="horizontal-period-nav flex space-x-2 min-w-max pb-3 px-4">
                {periods.map((period, index) => (
                  <li
                    key={period.id}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-lg transition-all 
                      ${activeSection === period.slug 
                        ? "bg-[hsl(var(--primary))] text-white font-semibold" 
                        : "bg-gray-100 hover:bg-gray-200"
                      }
                    `}
                  >
                    <a
                      href={`#period-h-${period.slug}`}
                      onClick={(e) => handlePeriodClick(period.slug, e)}
                      className="flex items-center gap-2"
                    >
                      <div className="period-marker-mini flex items-center justify-center w-6 h-6 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <span>{period.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline ngang đơn giản - sẽ có thể cuộn ngang để xem */}
            <div className="simple-horizontal-timeline overflow-x-auto pb-2 pt-2">
              {/* Vùng chứa thanh timeline */}
              <div className="simple-timeline-track relative" style={{ minWidth: `${Math.max(periods.length * 250, 1000)}px`, height: '250px' }}>
                {/* Đường timeline chính */}
                <div className="h-2 bg-[#ccc] absolute left-0 right-0 top-1/2 transform -translate-y-1/2"></div>
                
                {/* Các điểm thời kỳ */}
                {periods.map((period, periodIndex) => {
                  const periodEvents = events.filter(event => event.periodId === period.id);
                  const periodPosition = `${(periodIndex / (periods.length - 1)) * 100}%`;
                  const isEven = periodIndex % 2 === 0;
                  
                  // Lấy sự kiện nổi bật nhất để hiển thị (nếu có)
                  const featuredEvent = periodEvents.length > 0 ? periodEvents[0] : null;
                  
                  return (
                    <div 
                      key={period.id} 
                      id={`period-h-${period.slug}`}
                      className="simple-period-marker absolute group"
                      style={{ 
                        left: periodPosition,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5
                      }}
                    >
                      {/* Điểm thời kỳ trên timeline */}
                      <div className="flex flex-col items-center">
                        <Link 
                          href={`/thoi-ky/${period.slug}`}
                          className={`w-12 h-12 rounded-full bg-[hsl(var(--primary))] text-white font-bold flex items-center justify-center relative shadow-md border-2 border-white hover:scale-110 transition-transform`}
                        >
                          {periodIndex + 1}
                        </Link>
                        
                        {/* Card thông tin */}
                        <div className={`mt-4 py-2 ${isEven ? 'mt-4' : 'mb-4'}`}>
                          <div 
                            className={`simple-period-info bg-white px-3 py-2 rounded shadow-md border border-gray-200 text-center w-44`}
                          >
                            <Link 
                              href={`/thoi-ky/${period.slug}`}
                              className="font-bold text-[hsl(var(--primary))] text-sm hover:underline"
                            >
                              {period.name}
                            </Link>
                            <div className="text-gray-600 text-xs">
                              {period.timeframe}
                            </div>
                            
                            {/* Hiển thị sự kiện tiêu biểu nếu có */}
                            {featuredEvent && (
                              <div className="event-preview mt-2 pt-2 border-t border-gray-100">
                                <div className="text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] inline-block px-2 rounded-full mb-1">
                                  {featuredEvent.year}
                                </div>
                                <Link 
                                  href={`/su-kien/${featuredEvent.id}/${slugify(featuredEvent.title)}`}
                                  className="text-xs font-medium line-clamp-2 hover:underline"
                                >
                                  {featuredEvent.title}
                                </Link>
                              </div>
                            )}
                            
                            {/* Số lượng sự kiện khác */}
                            {periodEvents.length > 1 && (
                              <Link 
                                href={`/thoi-ky/${period.slug}`}
                                className="text-xs text-[hsl(var(--primary))] hover:underline mt-2 inline-block"
                              >
                                +{periodEvents.length - 1} sự kiện khác
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Chỉ dẫn thời gian */}
                <div className="simple-timeline-hint absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-500 px-4">
                  <div>← Cổ đại</div>
                  <div>Hiện đại →</div>
                </div>
              </div>
            </div>
            
            {/* Hướng dẫn sử dụng */}
            <div className="text-center text-xs text-gray-500 mt-1 animate-pulse">
              <span>← Kéo ngang để xem toàn bộ dòng thời gian →</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

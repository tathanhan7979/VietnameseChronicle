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
          // BỐ CỤC NGANG (HORIZONTAL)
          <div className="mt-10">
            {/* Navigation menu ngang cho các thời kỳ */}
            <div className="mb-8 overflow-x-auto">
              <ul className="horizontal-period-nav flex space-x-2 min-w-max pb-4">
                {periods.map((period) => (
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
                        {periods.findIndex(p => p.id === period.id) + 1}
                      </div>
                      <span>{period.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horizontal timeline */}
            <div className="horizontal-timeline relative">
              {periods.map((period, periodIndex) => {
                const periodEvents = events.filter(
                  (event) => event.periodId === period.id
                );

                return (
                  <div
                    id={`period-h-${period.slug}`}
                    key={period.id}
                    className="mb-20"
                  >
                    {/* Period title */}
                    <div className="period-title-horizontal mb-6">
                      <h3 className="text-2xl font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                        <div className="period-number-circle w-10 h-10 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center font-bold">
                          {periodIndex + 1}
                        </div>
                        <Link
                          href={`/thoi-ky/${period.slug}`}
                          className="hover:underline"
                        >
                          {period.name} <span className="text-gray-600 text-xl">({period.timeframe})</span>
                        </Link>
                      </h3>
                    </div>

                    {/* Horizontal events container */}
                    <div className="horizontal-events-container relative">
                      {/* Timeline line */}
                      <div className="horizontal-timeline-line absolute h-1 bg-[hsl(var(--primary))] left-0 right-0 top-6"></div>
                      
                      {/* Events */}
                      <div className="horizontal-events-scroll overflow-x-auto pb-8">
                        <div className="horizontal-events-wrapper flex min-w-max space-x-8 pt-10">
                          {periodEvents.map((event, index) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="horizontal-event-card flex-none w-64 bg-white p-4 rounded-lg shadow-md border border-gray-200 relative"
                            >
                              {/* Event dot on timeline */}
                              <div className="horizontal-event-dot absolute w-4 h-4 rounded-full bg-[hsl(var(--primary))] top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"></div>
                              
                              {/* Timeline connector */}
                              <div className="horizontal-connector absolute w-1 h-10 bg-[hsl(var(--primary))] top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"></div>
                              
                              {/* Year */}
                              <div className="text-center mb-2">
                                <span className="inline-block bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-3 py-1 rounded-full text-sm font-semibold">
                                  {event.year}
                                </span>
                              </div>
                              
                              {/* Event content */}
                              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                                <h4 className="text-lg font-semibold mb-2 text-[hsl(var(--primary))] hover:underline">{event.title}</h4>
                              </Link>
                              
                              {event.imageUrl && (
                                <picture className="mb-3 block overflow-hidden rounded-md">
                                  <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-36 object-cover hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.currentTarget.src = "/uploads/error-img.png";
                                    }}
                                  />
                                </picture>
                              )}
                              
                              <p className="text-sm line-clamp-3 mb-3 text-gray-600">
                                {event.description}
                              </p>
                              
                              {event.eventTypes && event.eventTypes.length > 0 && (
                                <div className="event-tags mb-2 flex flex-wrap gap-1">
                                  {event.eventTypes.map((type) => (
                                    <span
                                      key={type.id}
                                      className="event-tag text-xs"
                                      style={{
                                        backgroundColor: type.color || "#C62828",
                                      }}
                                    >
                                      {type.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                                <div className="view-details mt-2 flex items-center justify-center">
                                  <span>Xem chi tiết</span>
                                  <ChevronRight className="h-5 w-5 transition-transform" />
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

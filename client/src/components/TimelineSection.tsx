import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { slugify } from "@/lib/utils";
import { PeriodData, EventData } from "@/lib/types";
import "../styles/timeline.css";
import { ChevronRight, Clock, History, CalendarDays } from "lucide-react";

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
  const timelineRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  
  // Lấy tham số period từ URL khi quay lại trang chủ
  useEffect(() => {
    if (location.includes('?period=')) {
      // Tách lấy phần giữa ?period= và #
      let periodSlug;
      if (location.includes('#')) {
        periodSlug = location.split('?period=')[1].split('#')[0];
      } else {
        periodSlug = location.split('?period=')[1];
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
            <span className="whitespace-nowrap">Dòng Thời Gian Lịch Sử Việt Nam</span>
          </h2>
          <p>Khám phá dòng thời gian lịch sử 4000 năm của Việt Nam</p>
        </div>

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
                      <Link href={`/thoi-ky/${period.slug}`} className="hover:underline hover:text-[hsl(var(--primary))]">
                        <div className="flex items-center gap-2 justify-center">
                          <CalendarDays className="h-5 w-5 text-[#4527A0]" />
                          {period.name} <span>({period.timeframe})</span>
                        </div>
                      </Link>
                    </h3>
                  </div>

                  {/* Events container */}
                  <div className="timeline-events-container">
                    {periodEvents.map((event, index) => {
                      const isLeft = index % 2 === 0;

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
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="event-image"
                              />
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
      </div>
    </section>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NProgress from 'nprogress';
import Head from 'next/head';

// Component imports - these would be created separately based on your React components
// Here we're creating simplified versions for demonstration

interface TimelineEvent {
  id: number;
  title: string;
  year: string;
  description: string;
  periodId: number;
  imageUrl?: string;
  eventTypes?: {
    id: number;
    name: string;
    color: string;
  }[];
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

interface HistoricalFigure {
  id: number;
  name: string;
  description: string;
  lifespan: string;
  imageUrl: string;
  periodId: number;
}

interface HistoricalSite {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  periodId?: number;
}

interface HomePageProps {
  events: TimelineEvent[];
  periods: Period[];
  figures: HistoricalFigure[];
  sites: HistoricalSite[];
  backgroundImageUrl?: string;
}

// Helper function to create slugs
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Load all the data at build-time
    const periodsRes = await fetch('http://localhost:5000/api/periods');
    const periods = await periodsRes.json();
    
    const eventsRes = await fetch('http://localhost:5000/api/events');
    const events = await eventsRes.json();
    
    const figuresRes = await fetch('http://localhost:5000/api/historical-figures');
    const figures = await figuresRes.json();
    
    const sitesRes = await fetch('http://localhost:5000/api/historical-sites');
    const sites = await sitesRes.json();
    
    // Get background image from settings
    const backgroundRes = await fetch('http://localhost:5000/api/settings/home_background_url');
    const background = await backgroundRes.json();
    
    const backgroundImageUrl = background?.value || 'https://lichsuviet.edu.vn/uploads/banner-image.png';
    
    return {
      props: {
        events,
        periods,
        figures: figures.slice(0, 8), // Limit to 8 for the homepage
        sites: sites.slice(0, 6), // Limit to 6 for the homepage
        backgroundImageUrl,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      props: {
        events: [],
        periods: [],
        figures: [],
        sites: [],
      },
      revalidate: 60, // Try again sooner if there was an error
    };
  }
};

// Simplified Timeline Component
const Timeline = ({ events, periods }: { events: TimelineEvent[], periods: Period[] }) => {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  
  const filteredEvents = activePeriod 
    ? events.filter(event => {
        const period = periods.find(p => p.id === event.periodId);
        return period?.slug === activePeriod;
      })
    : events;
    
  return (
    <section id="timeline" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">
          Dòng thời gian lịch sử Việt Nam
        </h2>
        
        {/* Period Filter */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex space-x-2 pb-4 min-w-max">
            <button
              onClick={() => setActivePeriod(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activePeriod === null
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setActivePeriod(period.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activePeriod === period.slug
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Timeline Items */}
        <div className="relative">
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500"></div>
          
          <div className="space-y-12">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={event.id} 
                  className={`relative ${isLeft ? 'md:ml-0' : 'md:ml-[50%]'} md:w-[50%]`}
                >
                  <div className={`md:flex ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                    {/* Timeline marker */}
                    <div className="hidden md:block absolute top-6 w-6 h-6 rounded-full bg-red-500 z-10 transform -translate-y-1/2 left-[calc(0%-3px)]"></div>
                    
                    {/* Content */}
                    <div className={`relative bg-white rounded-lg shadow-md overflow-hidden md:mx-8 ${isLeft ? 'md:mr-8' : 'md:ml-8'}`}>
                      {event.imageUrl && (
                        <div className="h-48 relative">
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-red-600">
                            {event.title}
                          </h3>
                          <span className="text-gray-700 font-medium">{event.year}</span>
                        </div>
                        
                        {event.eventTypes && event.eventTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {event.eventTypes.map((type) => (
                              <span
                                key={type.id}
                                className="px-3 py-1 text-xs text-white rounded-full"
                                style={{ backgroundColor: type.color }}
                              >
                                {type.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <Link
                          href={`/su-kien/${event.id}/${slugify(event.title)}`}
                          className="text-red-600 font-medium hover:underline inline-flex items-center"
                        >
                          Xem chi tiết
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/su-kien"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Khám phá thêm sự kiện lịch sử
          </Link>
        </div>
      </div>
    </section>
  );
};

// Historical Figures Section
const HistoricalFiguresSection = ({ figures, periods }: { figures: HistoricalFigure[], periods: Period[] }) => {
  return (
    <section id="historical-figures" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">
          Nhân vật lịch sử tiêu biểu
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {figures.map((figure) => {
            const period = periods.find(p => p.id === figure.periodId);
            
            return (
              <Link
                key={figure.id}
                href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                className="block group"
              >
                <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-64 relative overflow-hidden">
                    {figure.imageUrl ? (
                      <Image
                        src={figure.imageUrl}
                        alt={figure.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-red-600 group-hover:text-red-700">
                      {figure.name}
                    </h3>
                    
                    {figure.lifespan && (
                      <p className="text-gray-500 text-sm mb-1">{figure.lifespan}</p>
                    )}
                    
                    {period && (
                      <p className="text-gray-500 text-sm mb-3">
                        Thời kỳ: {period.name}
                      </p>
                    )}
                    
                    <p className="text-gray-600 line-clamp-3">{figure.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/nhan-vat"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Khám phá thêm nhân vật lịch sử
          </Link>
        </div>
      </div>
    </section>
  );
};

// Historical Sites Section
const HistoricalSitesSection = ({ sites, periods }: { sites: HistoricalSite[], periods: Period[] }) => {
  return (
    <section id="historical-sites" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">
          Di tích lịch sử Việt Nam
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map((site) => {
            const period = site.periodId ? periods.find(p => p.id === site.periodId) : null;
            
            return (
              <Link
                key={site.id}
                href={`/di-tich/${site.id}/${slugify(site.name)}`}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-52 relative overflow-hidden">
                    {site.imageUrl ? (
                      <Image
                        src={site.imageUrl}
                        alt={site.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white/90 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {site.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-red-600 group-hover:text-red-700">
                      {site.name}
                    </h3>
                    
                    {period && (
                      <p className="text-gray-500 text-sm mb-3">
                        Thời kỳ: {period.name}
                      </p>
                    )}
                    
                    <p className="text-gray-600 line-clamp-3">{site.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/di-tich"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Khám phá thêm di tích lịch sử
          </Link>
        </div>
      </div>
    </section>
  );
};

// Hero Section
const HeroSection = ({ backgroundImageUrl }: { backgroundImageUrl?: string }) => {
  return (
    <section 
      className="relative h-screen flex items-center"
      style={{
        backgroundImage: `url(${backgroundImageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lịch Sử Việt Nam
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Khám phá hành trình dựng nước và giữ nước của dân tộc Việt Nam qua các thời kỳ lịch sử
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#timeline"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Bắt đầu khám phá
            </a>
            <Link
              href="/tim-kiem"
              className="bg-transparent hover:bg-white/10 text-white border border-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Tìm kiếm
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <a
          href="#timeline"
          className="animate-bounce p-2 bg-white/10 rounded-full"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default function HomePage({ events, periods, figures, sites, backgroundImageUrl }: HomePageProps) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // Refs for each section
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const figuresRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);

  // Handle section change on scroll
  useEffect(() => {
    // Map the individual refs to the sections ref object
    sectionsRef.current = {
      'hero': heroRef.current,
      'timeline': timelineRef.current,
      'historical-figures': figuresRef.current,
      'historical-sites': sitesRef.current
    };
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset to trigger section change a bit earlier
      
      for (const section of ['hero', 'timeline', 'historical-figures', 'historical-sites']) {
        const element = sectionsRef.current[section];
        
        if (element) {
          const { offsetTop, offsetHeight } = element;
          
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle smooth scrolling to sections
  const handleSectionSelect = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      NProgress.start();
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth',
      });
      setTimeout(() => {
        NProgress.done();
        setActiveSection(sectionId);
      }, 1000);
    }
  };
  
  return (
    <Layout
      title="Lịch Sử Việt Nam"
      description="Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện quan trọng, nhân vật lịch sử và di tích văn hóa."
      url="https://lichsuviet.edu.vn"
      image={backgroundImageUrl || "https://lichsuviet.edu.vn/uploads/banner-image.png"}
    >
      <div ref={heroRef} id="hero">
        <HeroSection backgroundImageUrl={backgroundImageUrl} />
      </div>
      
      <div ref={timelineRef} id="timeline">
        <Timeline events={events} periods={periods} />
      </div>
      
      <div ref={figuresRef} id="historical-figures">
        <HistoricalFiguresSection figures={figures} periods={periods} />
      </div>
      
      <div ref={sitesRef} id="historical-sites">
        <HistoricalSitesSection sites={sites} periods={periods} />
      </div>
    </Layout>
  );
}
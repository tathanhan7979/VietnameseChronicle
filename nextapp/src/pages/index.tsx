import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';

// Types
interface PeriodData {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

interface EventData {
  id: number;
  periodId: number;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
  eventTypes?: { id: number; name: string; color: string }[];
}

interface HistoricalFigure {
  id: number;
  name: string;
  periodId: number;
  description: string;
  lifespan: string;
  imageUrl: string;
}

interface HistoricalSite {
  id: number;
  name: string;
  periodId: number;
  location: string;
  description: string;
  imageUrl?: string;
  mapUrl?: string;
}

interface HomePageProps {
  periods: PeriodData[];
  events: EventData[];
  figures: HistoricalFigure[];
  sites: HistoricalSite[];
  backgroundImage: string;
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
    // Fetch periods
    const periodsRes = await fetch('http://localhost:5000/api/periods');
    const periods = await periodsRes.json();

    // Fetch events
    const eventsRes = await fetch('http://localhost:5000/api/events');
    const events = await eventsRes.json();

    // Fetch historical figures
    const figuresRes = await fetch('http://localhost:5000/api/historical-figures');
    const figures = await figuresRes.json();

    // Fetch historical sites
    const sitesRes = await fetch('http://localhost:5000/api/historical-sites');
    const sites = await sitesRes.json();

    // Fetch background image
    const bgImageRes = await fetch('http://localhost:5000/api/settings/home_background_url');
    const bgImageData = await bgImageRes.json();
    const backgroundImage = bgImageData.value || 'https://lichsuviet.edu.vn/uploads/banner-image.png';

    return {
      props: {
        periods,
        events,
        figures,
        sites,
        backgroundImage,
      },
      // Revalidate every hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        periods: [],
        events: [],
        figures: [],
        sites: [],
        backgroundImage: 'https://lichsuviet.edu.vn/uploads/banner-image.png',
      },
      revalidate: 60,
    };
  }
};

export default function HomePage({ periods, events, figures, sites, backgroundImage }: HomePageProps) {
  return (
    <Layout
      title="Trang Chủ | Lịch Sử Việt Nam" 
      description="Khám phá lịch sử Việt Nam qua các thời kỳ với đầy đủ thông tin về sự kiện, nhân vật và di tích lịch sử."
      url="https://lichsuviet.edu.vn"
    >
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Banner Lịch Sử Việt Nam"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Lịch Sử Việt Nam
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Hành trình khám phá di sản lịch sử hơn 4.000 năm của dân tộc Việt
            </p>
            <div className="flex space-x-4">
              <a 
                href="#timeline" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Khám phá dòng thời gian
              </a>
              <a 
                href="#historical-figures" 
                className="bg-transparent hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg border-2 border-white transition-colors"
              >
                Tìm hiểu nhân vật lịch sử
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-600">
            Dòng Thời Gian Lịch Sử Việt Nam
          </h2>
          
          {periods.length > 0 ? (
            <div className="timeline-container pb-20">
              <div className="timeline-line"></div>
              
              {periods.map((period, index) => {
                // Lọc các sự kiện theo thời kỳ
                const periodEvents = events.filter(event => event.periodId === period.id);
                
                return (
                  <div key={period.id} className="mb-20">
                    <div className="flex items-center justify-center mb-10 relative">
                      <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center z-10">
                        <span className="material-icons text-2xl">{period.icon || 'event'}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-red-600 absolute mt-20">
                        {period.name} ({period.timeframe})
                      </h3>
                    </div>
                    
                    <div className="mt-16">
                      {periodEvents.length > 0 ? (
                        <div>
                          {periodEvents.slice(0, 4).map((event, eventIndex) => (
                            <div key={event.id} className="timeline-item">
                              <div className="timeline-dot"></div>
                              <div className="timeline-date md:hidden">
                                {event.year}
                              </div>
                              <div className="bg-white p-6 rounded-lg shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="text-xl font-semibold text-red-600">
                                    {event.title}
                                  </h4>
                                  <span className="hidden md:block text-gray-600 font-semibold">
                                    {event.year}
                                  </span>
                                </div>
                                
                                {event.eventTypes && event.eventTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {event.eventTypes.map(type => (
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
                                
                                <p className="text-gray-700 mb-4 line-clamp-2">
                                  {event.description}
                                </p>
                                
                                <Link
                                  href={`/su-kien/${event.id}/${slugify(event.title)}`}
                                  className="text-red-600 hover:text-red-800 font-medium inline-flex items-center"
                                >
                                  Chi tiết
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
                                    ></path>
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">
                          Chưa có sự kiện nào trong thời kỳ này.
                        </p>
                      )}
                      
                      {periodEvents.length > 4 && (
                        <div className="text-center mt-10">
                          <Link
                            href={`/thoi-ky/${period.slug}`}
                            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                          >
                            Xem tất cả sự kiện trong thời kỳ {period.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Đang tải dữ liệu dòng thời gian...</p>
            </div>
          )}
        </div>
      </section>

      {/* Historical Figures Section */}
      <section id="historical-figures" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-600">
            Nhân Vật Lịch Sử Tiêu Biểu
          </h2>
          
          {figures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {figures.slice(0, 8).map((figure) => {
                const periodName = periods.find(p => p.id === figure.periodId)?.name || '';
                
                return (
                  <Link
                    key={figure.id}
                    href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all group-hover:shadow-lg h-full">
                      <div className="h-64 relative overflow-hidden">
                        {figure.imageUrl ? (
                          <Image
                            src={figure.imageUrl}
                            alt={figure.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="material-icons text-4xl text-gray-400">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-red-600 group-hover:text-red-700">
                          {figure.name}
                        </h3>
                        {figure.lifespan && (
                          <p className="text-gray-600 text-sm mb-2">
                            {figure.lifespan}
                          </p>
                        )}
                        {periodName && (
                          <p className="text-gray-600 text-sm mb-3">
                            Thời kỳ: {periodName}
                          </p>
                        )}
                        <p className="text-gray-700 line-clamp-3">
                          {figure.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Đang tải dữ liệu nhân vật lịch sử...</p>
            </div>
          )}
          
          {figures.length > 8 && (
            <div className="text-center mt-12">
              <Link 
                href="/nhan-vat" 
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Xem tất cả nhân vật lịch sử
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Historical Sites Section */}
      <section id="historical-sites" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-600">
            Di Tích Lịch Sử Nổi Bật
          </h2>
          
          {sites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sites.slice(0, 6).map((site) => {
                const periodName = periods.find(p => p.id === site.periodId)?.name || '';
                
                return (
                  <Link
                    key={site.id}
                    href={`/di-tich/${site.id}/${slugify(site.name)}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all group-hover:shadow-lg h-full">
                      <div className="h-56 relative overflow-hidden">
                        {site.imageUrl ? (
                          <Image
                            src={site.imageUrl}
                            alt={site.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="material-icons text-4xl text-gray-400">
                              location_on
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-xl font-bold text-white">
                            {site.name}
                          </h3>
                          <p className="text-white/80 text-sm flex items-center">
                            <span className="material-icons text-sm mr-1">
                              place
                            </span>
                            {site.location}
                          </p>
                        </div>
                      </div>
                      <div className="p-6">
                        {periodName && (
                          <p className="text-red-600 text-sm mb-3 font-medium">
                            Thời kỳ: {periodName}
                          </p>
                        )}
                        <p className="text-gray-700 line-clamp-3">
                          {site.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Đang tải dữ liệu di tích lịch sử...</p>
            </div>
          )}
          
          {sites.length > 6 && (
            <div className="text-center mt-12">
              <Link 
                href="/di-tich" 
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Xem tất cả di tích lịch sử
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
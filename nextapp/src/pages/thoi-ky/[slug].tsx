import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import FacebookComments from '../../components/FacebookComments';

// Types
interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
  eventTypes?: { id: number; name: string; color: string }[];
}

interface HistoricalFigure {
  id: number;
  name: string;
  description: string;
  lifespan: string;
  imageUrl: string;
}

interface HistoricalSite {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  mapUrl?: string;
}

interface PeriodDetailProps {
  period: Period;
  events: Event[];
  figures: HistoricalFigure[];
  sites: HistoricalSite[];
}

// Helper function to create URL-friendly slugs
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch period data
    const periodRes = await fetch(`http://localhost:5000/api/periods/slug/${params.slug}`);
    
    if (!periodRes.ok) {
      return { notFound: true };
    }
    
    const period: Period = await periodRes.json();
    
    // Fetch related events
    const eventsRes = await fetch(`http://localhost:5000/api/events/period-slug/${params.slug}`);
    let events: Event[] = [];
    if (eventsRes.ok) {
      events = await eventsRes.json();
    }
    
    // Fetch related historical figures
    const figuresRes = await fetch(`http://localhost:5000/api/historical-figures/period/${period.id}`);
    let figures: HistoricalFigure[] = [];
    if (figuresRes.ok) {
      figures = await figuresRes.json();
    }
    
    // Fetch related historical sites
    const sitesRes = await fetch(`http://localhost:5000/api/periods-slug/${params.slug}/historical-sites`);
    let sites: HistoricalSite[] = [];
    if (sitesRes.ok) {
      sites = await sitesRes.json();
    }
    
    return {
      props: {
        period,
        events,
        figures,
        sites,
      },
    };
  } catch (error) {
    console.error('Error fetching period data:', error);
    return { notFound: true };
  }
};

export default function PeriodDetail({ period, events, figures, sites }: PeriodDetailProps) {
  // Canonical URL for SEO
  const canonicalUrl = `https://lichsuviet.edu.vn/thoi-ky/${period.slug}`;
  
  return (
    <Layout
      title={`${period.name} (${period.timeframe}) | Lịch Sử Việt Nam`}
      description={period.description || `Thông tin chi tiết về thời kỳ ${period.name} trong lịch sử Việt Nam.`}
      url={canonicalUrl}
      type="article"
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
            >
              ← Trở về trang chủ
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Period header */}
            <div className="bg-red-600 text-white p-8 relative">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <span className="material-icons text-3xl">{period.icon || 'event'}</span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{period.name}</h1>
                  <p className="text-white/90 text-lg">{period.timeframe}</p>
                </div>
              </div>
              <p className="text-white/80 text-lg max-w-3xl">{period.description}</p>
            </div>

            {/* Period content section */}
            <div className="p-6 md:p-8">
              {/* Events section */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-red-600 mb-6">
                  Sự kiện trong thời kỳ {period.name}
                </h2>
                
                {events.length > 0 ? (
                  <div className="space-y-6">
                    {events.map((event) => (
                      <Link 
                        href={`/su-kien/${event.id}/${slugify(event.title)}`}
                        key={event.id}
                        className="block group"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6">
                          <div className="md:flex items-start">
                            {event.imageUrl && (
                              <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                                <div className="relative h-48 overflow-hidden rounded-md">
                                  <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className={event.imageUrl ? 'md:w-3/4' : 'w-full'}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-red-600 group-hover:text-red-700">
                                  {event.title}
                                </h3>
                                {event.year && (
                                  <span className="text-gray-600 font-semibold ml-4">
                                    {event.year}
                                  </span>
                                )}
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
                              
                              <p className="text-gray-700 mb-3">{event.description}</p>
                              
                              <span className="text-red-600 font-medium inline-flex items-center group-hover:text-red-800">
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
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <span className="material-icons text-5xl text-gray-400 mb-4">
                      event_busy
                    </span>
                    <p className="text-gray-500">
                      Chưa có sự kiện nào trong thời kỳ này
                    </p>
                  </div>
                )}
              </section>

              {/* Historical Figures section */}
              {figures.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Nhân vật tiêu biểu thời kỳ {period.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {figures.map((figure) => (
                      <Link
                        key={figure.id}
                        href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                        className="block group"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="h-56 relative overflow-hidden">
                            {figure.imageUrl ? (
                              <Image
                                src={figure.imageUrl}
                                alt={figure.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <span className="material-icons text-4xl">person</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 text-red-600 group-hover:text-red-700">
                              {figure.name}
                            </h3>
                            {figure.lifespan && (
                              <p className="text-sm text-gray-600 mb-2">{figure.lifespan}</p>
                            )}
                            <p className="text-gray-700 line-clamp-3">
                              {figure.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Historical Sites section */}
              {sites.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Di tích thời kỳ {period.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                      <Link
                        key={site.id}
                        href={`/di-tich/${site.id}/${slugify(site.name)}`}
                        className="block group"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="h-48 relative overflow-hidden">
                            {site.imageUrl ? (
                              <Image
                                src={site.imageUrl}
                                alt={site.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <span className="material-icons text-4xl">place</span>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <p className="text-white/80 text-sm flex items-center">
                                <span className="material-icons text-sm mr-1">place</span>
                                {site.location}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 text-red-600 group-hover:text-red-700">
                              {site.name}
                            </h3>
                            <p className="text-gray-700 line-clamp-3">
                              {site.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Facebook Comments */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <FacebookComments url={canonicalUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
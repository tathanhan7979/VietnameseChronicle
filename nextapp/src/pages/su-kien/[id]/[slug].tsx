import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../../components/Layout';
import FacebookComments from '../../../components/FacebookComments';

// Types
interface Event {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;
  year: string;
  imageUrl?: string;
  periodId: number;
  eventTypes?: { id: number; name: string; color: string }[];
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
  imageUrl?: string;
  lifespan: string;
}

interface EventDetailProps {
  event: Event;
  period: Period | null;
  relatedEvents: Event[];
  relatedFigures: HistoricalFigure[];
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

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  if (!params?.id) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch event data
    const eventRes = await fetch(`http://localhost:5000/api/events/${params.id}`);
    
    if (!eventRes.ok) {
      return { notFound: true };
    }
    
    const event: Event = await eventRes.json();
    
    // Redirect if the slug doesn't match
    const correctSlug = slugify(event.title);
    if (params.slug !== correctSlug) {
      return {
        redirect: {
          destination: `/su-kien/${params.id}/${correctSlug}`,
          permanent: true,
        },
      };
    }
    
    // Fetch period data if it exists
    let period = null;
    if (event.periodId) {
      const periodRes = await fetch(`http://localhost:5000/api/periods/${event.periodId}`);
      if (periodRes.ok) {
        period = await periodRes.json();
      }
    }
    
    // Fetch related events from the same period
    let relatedEvents: Event[] = [];
    if (period?.id) {
      const relatedRes = await fetch(`http://localhost:5000/api/events/period/${period.id}`);
      if (relatedRes.ok) {
        const allEvents = await relatedRes.json();
        relatedEvents = allEvents
          .filter((e: Event) => e.id !== event.id)
          .slice(0, 3);
      }
    }
    
    // Fetch related historical figures
    let relatedFigures: HistoricalFigure[] = [];
    const figuresRes = await fetch(`http://localhost:5000/api/historical-figures/period/${event.periodId}`);
    if (figuresRes.ok) {
      relatedFigures = await figuresRes.json();
      relatedFigures = relatedFigures.slice(0, 4); // Limit to 4
    }
    
    return {
      props: {
        event,
        period,
        relatedEvents,
        relatedFigures,
      },
    };
  } catch (error) {
    console.error('Error fetching event data:', error);
    return { notFound: true };
  }
};

export default function EventDetail({ event, period, relatedEvents, relatedFigures }: EventDetailProps) {
  // Construct canonical URL
  const canonicalUrl = `https://lichsuviet.edu.vn/su-kien/${event.id}/${slugify(event.title)}`;
  
  return (
    <Layout
      title={`${event.title} (${event.year}) | Lịch Sử Việt Nam`}
      description={event.description || `Thông tin chi tiết về sự kiện ${event.title} diễn ra vào năm ${event.year} trong lịch sử Việt Nam.`}
      image={event.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png'}
      type="article"
      url={canonicalUrl}
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
            {/* Hero section with image (if available) */}
            {event.imageUrl && (
              <div className="relative h-64 md:h-96 overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={1200}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                    <div className="flex flex-wrap items-center text-white/90 mb-2">
                      <span className="mr-4 flex items-center">
                        <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.year}
                      </span>
                      
                      {period && (
                        <Link href={`/thoi-ky/${period.slug}`} className="flex items-center hover:text-white">
                          <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Thời kỳ: {period.name}
                        </Link>
                      )}
                    </div>
                    
                    {event.eventTypes && event.eventTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
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
                  </div>
                </div>
              </div>
            )}

            {/* Content section */}
            <div className="p-6 md:p-8">
              {/* If no image, show title here */}
              {!event.imageUrl && (
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">{event.title}</h1>
                  <div className="flex flex-wrap gap-y-2 md:items-center text-gray-600 mb-4">
                    <div className="flex items-center mr-6">
                      <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.year}
                    </div>
                    
                    {period && (
                      <Link href={`/thoi-ky/${period.slug}`} className="flex items-center text-gray-600 hover:text-red-600">
                        <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Thời kỳ: {period.name}
                      </Link>
                    )}
                  </div>
                  
                  {event.eventTypes && event.eventTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
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
                </div>
              )}

              {/* Divider */}
              <div className="border-b border-gray-200 opacity-50 my-6"></div>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                {event.detailedDescription ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-600">
                      Tóm tắt
                    </h3>
                    <p className="text-lg mb-6">{event.description}</p>

                    <h3 className="text-xl font-semibold my-4 text-red-600">
                      Chi tiết
                    </h3>
                    <div className="text-lg mb-6">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: event.detailedDescription,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-lg mb-6">{event.description}</p>
                )}
              </div>

              {/* Period info */}
              {period && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Về thời kỳ {period.name}
                  </h2>
                  <div className="flex items-start gap-4">
                    {period.icon && (
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white shrink-0">
                        <span className="material-icons">{period.icon}</span>
                      </div>
                    )}
                    <div>
                      <p className="mb-2">{period.description}</p>
                      <p className="text-sm text-gray-600">
                        Khung thời gian: {period.timeframe}
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`/thoi-ky/${period.slug}`}
                          className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                        >
                          Xem thời kỳ {period.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Historical Figures */}
              {relatedFigures.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Nhân vật lịch sử liên quan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedFigures.map((figure) => (
                      <Link
                        href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                        key={figure.id}
                        className="block group"
                      >
                        <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="h-52 relative overflow-hidden">
                            {figure.imageUrl ? (
                              <Image
                                src={figure.imageUrl}
                                alt={figure.name}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 text-red-600 group-hover:text-red-700">
                              {figure.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{figure.lifespan}</p>
                            <p className="text-gray-600 line-clamp-2">{figure.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Các sự kiện liên quan
                  </h2>
                  <div className="space-y-6">
                    {relatedEvents.map((relEvent) => (
                      <Link
                        href={`/su-kien/${relEvent.id}/${slugify(relEvent.title)}`}
                        key={relEvent.id}
                        className="block"
                      >
                        <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors">
                          <div className="flex flex-col md:flex-row gap-4">
                            {relEvent.imageUrl && (
                              <div className="md:w-1/4">
                                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                                  <Image
                                    src={relEvent.imageUrl}
                                    alt={relEvent.title}
                                    width={300}
                                    height={200}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                            )}
                            <div className={relEvent.imageUrl ? 'md:w-3/4' : 'w-full'}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-red-600">
                                  {relEvent.title}
                                </h3>
                                <span className="text-gray-700 font-medium shrink-0 ml-2">
                                  {relEvent.year}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2 line-clamp-2">
                                {relEvent.description}
                              </p>
                              <span className="text-red-600 font-medium hover:underline inline-flex items-center">
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
                </div>
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
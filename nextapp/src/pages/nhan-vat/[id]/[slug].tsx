import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../../components/Layout';
import FacebookComments from '../../../components/FacebookComments';

// Types
interface HistoricalFigure {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;
  lifespan: string;
  imageUrl?: string;
  periodId: number;
  achievements?: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  year?: string;
}

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
  year: string;
  description: string;
  imageUrl?: string;
}

interface HistoricalFigureDetailProps {
  figure: HistoricalFigure;
  period: Period | null;
  relatedFigures: HistoricalFigure[];
  periodEvents: Event[];
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
  if (!params?.id) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch figure data
    const figureRes = await fetch(`http://localhost:5000/api/historical-figures/${params.id}`);
    
    if (!figureRes.ok) {
      return { notFound: true };
    }
    
    const figure: HistoricalFigure = await figureRes.json();
    
    // Redirect if the slug doesn't match
    const correctSlug = slugify(figure.name);
    if (params.slug !== correctSlug) {
      return {
        redirect: {
          destination: `/nhan-vat/${params.id}/${correctSlug}`,
          permanent: true,
        },
      };
    }
    
    // Fetch period data if it exists
    let period = null;
    if (figure.periodId) {
      const periodRes = await fetch(`http://localhost:5000/api/periods/${figure.periodId}`);
      if (periodRes.ok) {
        period = await periodRes.json();
      }
    }
    
    // Fetch related figures from the same period
    let relatedFigures: HistoricalFigure[] = [];
    if (period?.id) {
      const relatedRes = await fetch(`http://localhost:5000/api/historical-figures/period/${period.id}`);
      if (relatedRes.ok) {
        const allFigures = await relatedRes.json();
        relatedFigures = allFigures
          .filter((f: HistoricalFigure) => f.id !== figure.id)
          .slice(0, 3);
      }
    }
    
    // Fetch events from the same period
    let periodEvents: Event[] = [];
    if (period?.id) {
      const eventsRes = await fetch(`http://localhost:5000/api/events/period/${period.id}`);
      if (eventsRes.ok) {
        periodEvents = await eventsRes.json();
        periodEvents = periodEvents.slice(0, 4); // Limit to 4 events
      }
    }
    
    return {
      props: {
        figure,
        period,
        relatedFigures,
        periodEvents,
      },
    };
  } catch (error) {
    console.error('Error fetching historical figure data:', error);
    return { notFound: true };
  }
};

export default function HistoricalFigureDetail({ figure, period, relatedFigures, periodEvents }: HistoricalFigureDetailProps) {
  // Construct canonical URL
  const canonicalUrl = `https://lichsuviet.edu.vn/nhan-vat/${figure.id}/${slugify(figure.name)}`;
  
  return (
    <Layout
      title={`${figure.name} (${figure.lifespan}) | Nhân Vật Lịch Sử Việt Nam`}
      description={figure.description || `Thông tin chi tiết về ${figure.name}, một nhân vật lịch sử quan trọng của Việt Nam ${period ? `trong thời kỳ ${period.name}` : ''}.`}
      image={figure.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png'}
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
            {/* Hero section */}
            <div className="bg-red-600 text-white p-8">
              <div className="md:flex items-center">
                {figure.imageUrl && (
                  <div className="md:w-1/4 flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                    <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-4 border-white/30">
                      <Image
                        src={figure.imageUrl}
                        alt={figure.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                )}
                
                <div className="md:w-3/4">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{figure.name}</h1>
                  
                  <div className="text-white/90 mb-4">
                    <span className="inline-flex items-center mr-4">
                      <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {figure.lifespan}
                    </span>
                    
                    {period && (
                      <Link href={`/thoi-ky/${period.slug}`} className="inline-flex items-center hover:text-white">
                        <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Thời kỳ: {period.name}
                      </Link>
                    )}
                  </div>
                  
                  <p className="text-white/80 text-lg">
                    {figure.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 md:p-8">
              {/* Achievements section */}
              {figure.achievements && figure.achievements.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Thành tựu nổi bật
                  </h2>
                  <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-500">
                    {figure.achievements.map((achievement, index) => (
                      <div key={achievement.id} className="relative before:absolute before:left-[-26px] before:top-3 before:w-4 before:h-4 before:rounded-full before:bg-red-500">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-red-600">
                              {achievement.title}
                            </h3>
                            {achievement.year && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {achievement.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed description */}
              {figure.detailedDescription && (
                <div className="prose prose-lg max-w-none mb-8">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Tiểu sử chi tiết
                  </h2>
                  <div className="text-lg mb-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: figure.detailedDescription,
                      }}
                    />
                  </div>
                </div>
              )}

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

              {/* Related Events */}
              {periodEvents.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Các sự kiện trong cùng thời kỳ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {periodEvents.map((event) => (
                      <Link
                        href={`/su-kien/${event.id}/${slugify(event.title)}`}
                        key={event.id}
                        className="block group"
                      >
                        <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-red-600 group-hover:text-red-700">
                              {event.title}
                            </h3>
                            <span className="text-gray-600 shrink-0 ml-2">{event.year}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{event.description}</p>
                          <span className="mt-2 text-red-600 font-medium inline-flex items-center group-hover:text-red-800">
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
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Historical Figures */}
              {relatedFigures.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Nhân vật lịch sử cùng thời
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedFigures.map((relFigure) => (
                      <Link
                        href={`/nhan-vat/${relFigure.id}/${slugify(relFigure.name)}`}
                        key={relFigure.id}
                        className="block group"
                      >
                        <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="h-48 relative overflow-hidden">
                            {relFigure.imageUrl ? (
                              <Image
                                src={relFigure.imageUrl}
                                alt={relFigure.name}
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
                              {relFigure.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{relFigure.lifespan}</p>
                            <p className="text-gray-600 line-clamp-2">{relFigure.description}</p>
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
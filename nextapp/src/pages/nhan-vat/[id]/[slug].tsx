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
  periodId: number;
  lifespan: string;
  description: string;
  detailedDescription?: string;
  imageUrl: string;
  achievements?: { id: string; title: string; year?: string; }[];
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

interface HistoricalFigureDetailProps {
  figure: HistoricalFigure;
  period: Period | null;
  relatedFigures: HistoricalFigure[];
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

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
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
    if (figure.periodId) {
      const relatedRes = await fetch(`http://localhost:5000/api/historical-figures/period/${figure.periodId}`);
      if (relatedRes.ok) {
        const allFigures = await relatedRes.json();
        relatedFigures = allFigures.filter((f: HistoricalFigure) => f.id !== figure.id).slice(0, 3);
      }
    }
    
    return {
      props: {
        figure,
        period,
        relatedFigures,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { notFound: true };
  }
};

export default function HistoricalFigureDetail({ figure, period, relatedFigures }: HistoricalFigureDetailProps) {
  // Construct canonical URL and social sharing URL
  const canonicalUrl = `https://lichsuviet.edu.vn/nhan-vat/${figure.id}/${slugify(figure.name)}`;
  
  return (
    <Layout
      title={`${figure.name} ${figure.lifespan ? `(${figure.lifespan})` : ''} | Lịch Sử Việt Nam`}
      description={figure.description || `Thông tin chi tiết về nhân vật lịch sử ${figure.name} ${period ? `trong thời kỳ ${period.name}` : 'Việt Nam'}`}
      image={figure.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png'}
      type="article"
      url={canonicalUrl}
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link 
              href={period ? `/?period=${period.slug}#timeline` : '/'}
              className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
            >
              ← Trở về trang chủ
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Hero image section */}
              <div className="md:w-1/3 relative h-64 md:h-auto">
                {figure.imageUrl ? (
                  <Image
                    src={figure.imageUrl}
                    alt={figure.name}
                    width={500}
                    height={700}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="md:w-2/3 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {figure.name}
                </h1>
                
                <div className="flex flex-wrap gap-y-2 mb-4 text-gray-600">
                  {figure.lifespan && (
                    <div className="flex items-center mr-6">
                      <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{figure.lifespan}</span>
                    </div>
                  )}
                  
                  {period && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Thời kỳ: {period.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-lg max-w-none">
                  {/* Basic description */}
                  <p className="text-lg mb-6">{figure.description}</p>
                </div>
              </div>
            </div>

            {/* Detailed description section */}
            <div className="p-6 md:p-8 border-t border-gray-200">
              {figure.detailedDescription ? (
                <div>
                  <h2 className="text-2xl font-bold text-red-600 mb-6">
                    Chi tiết về {figure.name}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: figure.detailedDescription,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  Chưa có thông tin chi tiết về nhân vật lịch sử này.
                </div>
              )}
            </div>

            {/* Achievements section */}
            {figure.achievements && figure.achievements.length > 0 && (
              <div className="p-6 md:p-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-red-600 mb-6">
                  Thành tựu nổi bật
                </h2>
                <ul className="space-y-4">
                  {figure.achievements.map((achievement) => (
                    <li key={achievement.id} className="flex items-start">
                      <svg className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-lg">{achievement.title}</p>
                        {achievement.year && (
                          <p className="text-sm text-gray-600">{achievement.year}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Period info */}
            {period && (
              <div className="p-6 md:p-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  Về thời kỳ {period.name}
                </h2>
                <div className="flex items-start gap-4">
                  {period.icon && (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white">
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
              <div className="p-6 md:p-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-red-600 mb-6">
                  Nhân vật lịch sử cùng thời
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedFigures.map((relFigure) => (
                    <Link
                      href={`/nhan-vat/${relFigure.id}/${slugify(relFigure.name)}`}
                      key={relFigure.id}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                        <div className="h-40 bg-gray-200 relative">
                          {relFigure.imageUrl ? (
                            <Image
                              src={relFigure.imageUrl}
                              alt={relFigure.name}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {relFigure.name}
                          </h3>
                          {relFigure.lifespan && (
                            <p className="text-sm text-gray-600 mb-2">{relFigure.lifespan}</p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {relFigure.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {relatedFigures.length > 3 && period && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/thoi-ky/${period.slug}`}
                      className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                    >
                      Xem tất cả nhân vật trong thời kỳ {period.name}
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Facebook Comments */}
            <div className="p-6 md:p-8 border-t border-gray-200">
              <FacebookComments url={canonicalUrl} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
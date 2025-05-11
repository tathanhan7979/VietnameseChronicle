import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Types
interface HistoricalSite {
  id: number;
  name: string;
  periodId: number;
  location: string;
  description: string;
  detailedDescription?: string;
  imageUrl?: string;
  mapUrl?: string;
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

// Lấy metadata động cho trang
export async function generateMetadata({ params }: { params: { siteId: string } }): Promise<Metadata> {
  const site = await fetchHistoricalSite(params.siteId);
  
  if (!site) {
    return {
      title: 'Không tìm thấy di tích | Lịch Sử Việt Nam',
      description: 'Di tích lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }
  
  const period = site.periodId ? await fetchPeriod(site.periodId) : null;
  
  return {
    title: `${site.name} (${site.location}) | Di Tích Lịch Sử Việt Nam`,
    description: site.description || `Thông tin chi tiết về di tích lịch sử ${site.name} tại ${site.location} ${period ? `trong thời kỳ ${period.name}` : ''}`,
    openGraph: {
      title: `${site.name} - Di tích lịch sử tại ${site.location}`,
      description: site.description,
      url: `https://lichsuviet.edu.vn/di-tich/${site.id}/${slugify(site.name)}`,
      type: 'article',
      images: [
        {
          url: site.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png',
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    alternates: {
      canonical: `https://lichsuviet.edu.vn/di-tich/${site.id}/${slugify(site.name)}`,
    },
  };
}

// Hàm lấy dữ liệu di tích lịch sử
async function fetchHistoricalSite(id: string): Promise<HistoricalSite | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/historical-sites/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error('Error fetching historical site:', error);
    return null;
  }
}

// Hàm lấy dữ liệu thời kỳ
async function fetchPeriod(id: number): Promise<Period | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/periods/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error('Error fetching period:', error);
    return null;
  }
}

// Hàm lấy di tích lịch sử cùng thời kỳ
async function fetchRelatedSites(periodId: number, currentSiteId: string): Promise<HistoricalSite[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/historical-sites/period/${periodId}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return [];
    
    const sites = await res.json();
    return sites.filter((site: HistoricalSite) => site.id.toString() !== currentSiteId);
  } catch (error) {
    console.error('Error fetching related sites:', error);
    return [];
  }
}

// Hàm tạo slug từ chuỗi
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

export default async function HistoricalSiteDetail({ params }: { params: { siteId: string } }) {
  const site = await fetchHistoricalSite(params.siteId);
  
  if (!site) {
    notFound();
  }
  
  const period = site.periodId ? await fetchPeriod(site.periodId) : null;
  const relatedSites = period ? await fetchRelatedSites(period.id, params.siteId) : [];
  
  return (
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
          {site.imageUrl && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <Image
                src={site.imageUrl}
                alt={site.name}
                width={1200}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {site.name}
                  </h1>
                  <div className="flex items-center text-white/90 mb-1">
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{site.location}</span>
                  </div>
                  {period && (
                    <div className="flex items-center text-white/90">
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Thời kỳ: {period.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content section */}
          <div className="p-6 md:p-8">
            {/* If no image, show title here */}
            {!site.imageUrl && (
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                  {site.name}
                </h1>
                <div className="flex flex-wrap gap-y-2 md:items-center text-gray-600 mb-6">
                  <div className="flex items-center mr-6">
                    <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{site.location}</span>
                  </div>
                  {period && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Thời kỳ: {period.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              {site.detailedDescription ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-600">
                    Tóm tắt
                  </h3>
                  <p className="text-lg mb-6">{site.description}</p>

                  <h3 className="text-xl font-semibold my-4 text-red-600">
                    Chi tiết
                  </h3>
                  <div className="text-lg mb-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: site.detailedDescription,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-lg mb-6">{site.description}</p>
              )}
            </div>

            {/* Map section */}
            {site.mapUrl && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-red-600">
                  Vị trí trên bản đồ
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden h-96">
                  <iframe
                    src={site.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
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

            {/* Related Historical Sites */}
            {relatedSites.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-red-600 mb-6">
                  Các di tích lịch sử liên quan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedSites.slice(0, 3).map((relSite) => (
                    <Link
                      href={`/di-tich/${relSite.id}/${slugify(relSite.name)}`}
                      key={relSite.id}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                        <div className="h-40 bg-gray-200 relative">
                          {relSite.imageUrl ? (
                            <Image
                              src={relSite.imageUrl}
                              alt={relSite.name}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {relSite.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {relSite.location}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {relSite.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {relatedSites.length > 3 && period && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/thoi-ky/${period.slug}`}
                      className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                    >
                      Xem tất cả di tích trong thời kỳ {period.name}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
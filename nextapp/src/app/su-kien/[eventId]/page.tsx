import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Types
interface Event {
  id: number;
  periodId: number;
  title: string;
  description: string;
  detailedDescription?: string;
  year: string;
  imageUrl?: string;
  eventTypes?: { id: number; name: string; color: string; }[];
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
export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const event = await fetchEvent(params.eventId);
  
  if (!event) {
    return {
      title: 'Không tìm thấy sự kiện | Lịch Sử Việt Nam',
      description: 'Sự kiện lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }
  
  const period = event.periodId ? await fetchPeriod(event.periodId) : null;
  
  // Lấy thông tin loại sự kiện để hiển thị
  const eventTypeText = event.eventTypes && event.eventTypes.length > 0
    ? `[${event.eventTypes.map(t => t.name).join(', ')}]`
    : '';
  
  return {
    title: `${event.title} ${event.year ? `(${event.year})` : ''} ${eventTypeText} | Lịch Sử Việt Nam`,
    description: event.description || `Thông tin chi tiết về sự kiện lịch sử ${event.title} ${period ? `trong thời kỳ ${period.name}` : 'Việt Nam'}`,
    openGraph: {
      title: `${event.title} ${event.year ? `(${event.year})` : ''} | Lịch Sử Việt Nam`,
      description: event.description,
      url: `https://lichsuviet.edu.vn/su-kien/${event.id}/${slugify(event.title)}`,
      type: 'article',
      images: [
        {
          url: event.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    alternates: {
      canonical: `https://lichsuviet.edu.vn/su-kien/${event.id}/${slugify(event.title)}`,
    },
  };
}

// Hàm lấy dữ liệu sự kiện
async function fetchEvent(id: string): Promise<Event | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/events/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
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

// Hàm lấy các sự kiện liên quan cùng thời kỳ
async function fetchRelatedEvents(slug: string, currentEventId: string): Promise<Event[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/events/period-slug/${slug}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return [];
    
    const events = await res.json();
    return events.filter((event: Event) => event.id.toString() !== currentEventId);
  } catch (error) {
    console.error('Error fetching related events:', error);
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

export default async function EventDetail({ params }: { params: { eventId: string } }) {
  const event = await fetchEvent(params.eventId);
  
  if (!event) {
    notFound();
  }
  
  const period = event.periodId ? await fetchPeriod(event.periodId) : null;
  const relatedEvents = period ? await fetchRelatedEvents(period.slug, params.eventId) : [];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            href={period ? `/?period=${period.slug}#timeline` : '/'}
            className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
          >
            ← Trở về dòng thời gian
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {event.title}
                  </h1>
                  {event.eventTypes && event.eventTypes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {event.eventTypes.map((type) => (
                        <span
                          key={type.id}
                          className="inline-block text-white px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: type.color || "#ff5722" }}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {event.year && (
                    <div className="flex items-center text-white/90 mb-1">
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.year}</span>
                    </div>
                  )}
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
            {!event.imageUrl && (
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-y-2 md:items-center text-gray-600 mb-6">
                  {event.year && (
                    <div className="flex items-center mr-6">
                      <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.year}</span>
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
              </div>
            )}

            {/* Event types badges - only show when no image */}
            {!event.imageUrl && event.eventTypes && event.eventTypes.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-red-600">
                    Loại sự kiện:
                  </h3>
                  {event.eventTypes.map((type) => (
                    <span
                      key={type.id}
                      className="inline-block text-white px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: type.color || "#ff5722" }}
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
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

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-red-600 mb-6">
                  Các sự kiện liên quan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedEvents.slice(0, 3).map((relEvent) => (
                    <Link
                      href={`/su-kien/${relEvent.id}/${slugify(relEvent.title)}`}
                      key={relEvent.id}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
                        <div className="h-40 bg-gray-200 relative">
                          {relEvent.imageUrl ? (
                            <Image
                              src={relEvent.imageUrl}
                              alt={relEvent.title}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white font-medium">
                              {relEvent.year || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {relEvent.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {relEvent.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {relatedEvents.length > 3 && period && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/thoi-ky/${period.slug}`}
                      className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                    >
                      Xem tất cả sự kiện trong thời kỳ {period.name}
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
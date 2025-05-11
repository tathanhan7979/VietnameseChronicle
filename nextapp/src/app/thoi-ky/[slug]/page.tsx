import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Định nghĩa kiểu TypeScript
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

// Lấy metadata cụ thể cho từng trang thời kỳ
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const period = await fetchPeriod(params.slug);
  
  if (!period) {
    return {
      title: 'Không tìm thấy thời kỳ | Lịch Sử Việt Nam',
      description: 'Thời kỳ lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }
  
  return {
    title: `${period.name} (${period.timeframe}) | Lịch Sử Việt Nam`,
    description: period.description || `Khám phá thời kỳ ${period.name} trong lịch sử Việt Nam. Tìm hiểu về các sự kiện, nhân vật và di tích lịch sử quan trọng.`,
    openGraph: {
      title: `${period.name} (${period.timeframe}) | Lịch Sử Việt Nam`,
      description: period.description,
      url: `https://lichsuviet.edu.vn/thoi-ky/${period.slug}`,
      type: 'article',
      images: [
        {
          url: 'https://lichsuviet.edu.vn/uploads/banner-image.png',
          width: 1200,
          height: 630,
          alt: period.name,
        },
      ],
    },
    alternates: {
      canonical: `https://lichsuviet.edu.vn/thoi-ky/${period.slug}`,
    },
  };
}

// Hàm lấy dữ liệu thời kỳ
async function fetchPeriod(slug: string): Promise<Period | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/periods/slug/${slug}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error('Error fetching period:', error);
    return null;
  }
}

// Hàm lấy danh sách sự kiện của thời kỳ
async function fetchEvents(slug: string): Promise<Event[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/events/period-slug/${slug}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return [];
    
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Hàm lấy danh sách nhân vật lịch sử của thời kỳ
async function fetchHistoricalFigures(periodId: number): Promise<HistoricalFigure[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/historical-figures/period/${periodId}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return [];
    
    return res.json();
  } catch (error) {
    console.error('Error fetching historical figures:', error);
    return [];
  }
}

// Hàm lấy danh sách di tích lịch sử của thời kỳ
async function fetchHistoricalSites(slug: string): Promise<HistoricalSite[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/periods-slug/${slug}/historical-sites`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return [];
    
    return res.json();
  } catch (error) {
    console.error('Error fetching historical sites:', error);
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

export default async function PeriodDetail({ params }: { params: { slug: string } }) {
  const period = await fetchPeriod(params.slug);
  
  if (!period) {
    notFound();
  }
  
  const events = await fetchEvents(params.slug);
  const figures = await fetchHistoricalFigures(period.id);
  const sites = await fetchHistoricalSites(params.slug);
  
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <Link 
            href="/"
            className="inline-block px-4 py-2 mb-6 text-black border-white bg-white/90 hover:bg-red-600 hover:text-white rounded transition"
          >
            ← Trở về dòng thời gian
          </Link>

          <div className="flex items-center mb-4">
            <div className="mr-4 bg-white/20 p-3 rounded-full">
              {period.icon && (
                <span className="material-icons text-3xl">{period.icon}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {period.name}
              </h1>
              <div className="flex items-center">
                <span className="text-lg">{period.timeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Description card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Tổng quan
          </h2>
          <p className="text-gray-700 leading-relaxed">{period.description}</p>
        </div>

        {/* Tabs for different content types */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Các sự kiện ({events.length})</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có sự kiện</h3>
              <p className="text-gray-600">
                Chưa có sự kiện nào được thêm vào thời kỳ này.
              </p>
            </div>
          ) : (
            <div className="space-y-8 py-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-red-600">
                          {event.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <span>{event.year}</span>
                        </div>
                      </div>
                      {event.eventTypes && event.eventTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {event.eventTypes.map((type) => (
                            <span
                              key={type.id}
                              style={{ backgroundColor: type.color || "#C62828" }}
                              className="text-white px-2 py-1 rounded-full text-xs"
                            >
                              {type.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4">{event.description}</p>

                    <Link 
                      href={`/su-kien/${event.id}/${slugify(event.title)}`}
                      className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Historical Figures Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Nhân vật lịch sử ({figures.length})</h2>
          
          {figures.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-4">
                <svg
                  className="h-16 w-16 mx-auto opacity-25"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có nhân vật lịch sử</h3>
              <p className="text-gray-600">
                Chưa có nhân vật lịch sử nào được thêm vào thời kỳ này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {figures.map((figure) => (
                <div
                  key={figure.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-48 overflow-hidden relative">
                    {figure.imageUrl && (
                      <Image
                        src={figure.imageUrl}
                        alt={figure.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-xl">{figure.name}</h3>
                        <p className="text-white/80 text-sm">{figure.lifespan}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 line-clamp-3">{figure.description}</p>
                    <Link 
                      href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                      className="block mt-4 w-full px-4 py-2 border border-gray-300 rounded text-center text-sm hover:bg-gray-50 transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Historical Sites Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Di tích lịch sử ({sites.length})</h2>
          
          {sites.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có di tích lịch sử</h3>
              <p className="text-gray-600">
                Chưa có di tích lịch sử nào được thêm vào thời kỳ này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden relative">
                    {site.imageUrl && (
                      <Image
                        src={site.imageUrl}
                        alt={site.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-xl">{site.name}</h3>
                        <div className="flex items-center text-sm">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{site.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 line-clamp-3">{site.description}</p>
                    <div className="mt-4 flex justify-between gap-2">
                      {site.mapUrl && (
                        <a
                          href={site.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded text-center text-sm hover:bg-gray-50 transition flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Bản đồ
                        </a>
                      )}
                      <Link
                        href={`/di-tich/${site.id}/${slugify(site.name)}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded text-center text-sm hover:bg-gray-50 transition"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
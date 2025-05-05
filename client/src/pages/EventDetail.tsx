import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { EventData, PeriodData } from '@/lib/types';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

import { slugify } from '@/lib/utils';
import { ERROR_IMAGE } from '@/lib/constants';
import FacebookComments from '@/components/FacebookComments';
import SEO from '@/components/SEO';

export default function EventDetail() {
  const { eventId } = useParams();
  const isMobile = useMobile();
  const [location] = useLocation();
  
  // Fetch the specific event
  const { data: event, isLoading: isLoadingEvent, error: eventError } = useQuery<EventData>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  // Fetch the period this event belongs to
  const { data: period, isLoading: isLoadingPeriod } = useQuery<PeriodData>({
    queryKey: [`/api/periods/${event?.periodId}`],
    enabled: !!event,
  });
  
  // Lấy các sự kiện thuộc cùng thời kỳ (dùng slug)
  const { data: relatedEvents = [] } = useQuery<EventData[]>({
    queryKey: [`/api/events/period-slug/${period?.slug}`],
    enabled: !!period?.slug,
  });
  
  if (isLoadingEvent || isLoadingPeriod) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">Không tìm thấy sự kiện</h1>
        <p className="mb-8">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/">
          <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:opacity-90">
            <ArrowLeft className="mr-2" />
            Trở về trang chủ
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-[hsl(var(--background))] min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/#timeline">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2" />
              Trở về dòng thời gian
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero section with image (if available) */}
          {event.imageUrl && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <picture>
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = '/uploads/error-img.png';
                  }}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] mb-2">{event.title}</h1>
                  {event.eventTypes && event.eventTypes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {event.eventTypes.map(type => (
                        <span 
                          key={type.id}
                          className="inline-block text-white px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: type.color || '#ff5722' }}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {event.year && (
                    <div className="flex items-center text-white/90 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{event.year}</span>
                    </div>
                  )}
                  {period && (
                    <div className="flex items-center text-white/90">
                      <MapPin className="h-4 w-4 mr-2" />
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
                <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-y-2 md:items-center text-gray-600 mb-6">
                  {event.year && (
                    <div className="flex items-center mr-6">
                      <Calendar className="h-4 w-4 mr-2 text-[hsl(var(--secondary))]" />
                      <span>{event.year}</span>
                    </div>
                  )}
                  {period && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[hsl(var(--secondary))]" />
                      <span>Thời kỳ: {period.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Event types badges - Di chuyển lên trên (chỉ hiện khi không có ảnh) */}
            {!event.imageUrl && event.eventTypes && event.eventTypes.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                    Loại sự kiện:
                  </h3>
                  {event.eventTypes.map(type => (
                    <span 
                      key={type.id}
                      className="inline-block text-white px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: type.color || '#ff5722' }}
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Đường ngang tách phần header và nội dung */}
            <div className="border-b border-gray-200 opacity-50 my-6"></div>
            
            {/* Description */}
            <div className="prose prose-lg max-w-none">
              {event.detailedDescription ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
                    Tóm tắt
                  </h3>
                  <p className="text-lg mb-6">{event.description}</p>
                  
                  <h3 className="text-xl font-semibold my-4 text-[hsl(var(--primary))]">
                    Chi tiết
                  </h3>
                  <div className="text-lg mb-6">
                    <div dangerouslySetInnerHTML={{ __html: event.detailedDescription }} />
                  </div>
                </div>
              ) : (
                <p className="text-lg mb-6">{event.description}</p>
              )}
            </div>
            
            {/* Period info */}
            {period && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-4">Về thời kỳ {period.name}</h2>
                <div className="flex items-start gap-4">
                  {period.icon && (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-white">
                      <span className="material-icons">{period.icon}</span>
                    </div>
                  )}
                  <div>
                    <p className="mb-2">{period.description}</p>
                    <p className="text-sm text-gray-600">Khung thời gian: {period.timeframe}</p>
                    <div className="mt-4">
                      <Link href={`/thoi-ky/${period.slug}`}>
                        <Button variant="outline" size="sm">
                          Xem thời kỳ {period.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Related Events - Các sự kiện liên quan cùng thời kỳ */}
            {relatedEvents && relatedEvents.length > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-6">Các sự kiện liên quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedEvents
                    .filter(relEvent => relEvent.id !== Number(eventId)) // Loại bỏ sự kiện hiện tại
                    .slice(0, 6) // Giới hạn hiển thị 6 sự kiện
                    .map(relEvent => (
                      <Link href={`/su-kien/${relEvent.id}/${slugify(relEvent.title)}`} key={relEvent.id}>
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-40 bg-gray-200 relative">
                            {relEvent.imageUrl ? (
                              <img 
                                src={relEvent.imageUrl} 
                                alt={relEvent.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = ERROR_IMAGE;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <Calendar className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <p className="text-white font-medium">{relEvent.year || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relEvent.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3">{relEvent.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
                {relatedEvents.length > 6 && period && (
                  <div className="mt-6 text-center">
                    <Link href={`/thoi-ky/${period.slug}#events`}>
                      <Button variant="outline">
                        Xem tất cả sự kiện trong thời kỳ {period.name}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Facebook Comments */}
          <div className="p-6 md:p-8 bg-gray-50">
            <FacebookComments url={window.location.href} />
          </div>
        </div>
      </div>
    </div>
  );
}

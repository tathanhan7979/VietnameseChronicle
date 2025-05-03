import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { EventData, PeriodData } from '@/lib/types';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { PERIOD_ICONS } from '@/lib/constants';

export default function EventDetail() {
  const { eventId } = useParams();
  const isMobile = useMobile();
  
  // Fetch the specific event
  const { data: event, isLoading: isLoadingEvent, error: eventError } = useQuery<EventData>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  // Fetch the period this event belongs to
  const { data: period, isLoading: isLoadingPeriod } = useQuery<PeriodData>({
    queryKey: [`/api/periods/${event?.periodId}`],
    enabled: !!event,
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
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] mb-2">{event.title}</h1>
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
            
            {/* Event type badge */}
            {event.eventType && (
              <div className="mt-8">
                <span className="inline-block bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))] px-4 py-2 rounded-full text-sm font-medium">
                  {event.eventType}
                </span>
              </div>
            )}
            
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
                      <Link href={`/#period-${period.slug}`}>
                        <Button variant="outline" size="sm">
                          Xem các sự kiện khác trong thời kỳ này
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

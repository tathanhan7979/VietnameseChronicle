import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { EventData, PeriodData } from '@/lib/types';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, MapPin, ScrollText, Clock, Share2, ChevronRight, InfoIcon } from 'lucide-react';
import { PERIOD_ICONS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { motion } from 'framer-motion';

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
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Skeleton className="h-64 md:h-96 w-full" />
          <div className="p-6 md:p-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </div>
        </div>
      </div>
    );
  }
  
  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <InfoIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy sự kiện</h1>
          <p className="mb-8 text-gray-700">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Trở về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="relative">
        {event.imageUrl ? (
          <div className="relative h-[300px] md:h-[400px] overflow-hidden">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 z-20">
              <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-10">
                <div className="max-w-3xl">
                  <Link href="/#timeline">
                    <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Trở về dòng thời gian
                    </Button>
                  </Link>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                    {event.title}
                  </motion.h1>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {event.eventTypes && event.eventTypes.map(type => (
                      <Badge 
                        key={type.id}
                        className="text-white px-3 py-1 text-sm font-medium shadow-sm"
                        style={{ backgroundColor: type.color || '#ff5722' }}
                      >
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90">
                    {event.year && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-amber-300" />
                        <span>{event.year}</span>
                      </div>
                    )}
                    {period && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-300" />
                        <span>Thời kỳ {period.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-red-600 to-amber-700 py-16">
            <div className="container mx-auto px-4">
              <Link href="/#timeline">
                <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Trở về dòng thời gian
                </Button>
              </Link>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {event.eventTypes && event.eventTypes.map(type => (
                  <Badge 
                    key={type.id}
                    className="text-white px-3 py-1 text-sm font-medium shadow-sm"
                    style={{ backgroundColor: type.color || '#ff5722' }}
                  >
                    {type.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90">
                {event.year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-amber-300" />
                    <span>{event.year}</span>
                  </div>
                )}
                {period && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-300" />
                    <span>Thời kỳ {period.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8 max-w-4xl mx-auto -mt-10 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-red-700 prose-a:text-blue-600"
            variants={itemVariants}
          >
            {event.detailedDescription ? (
              <div>
                <div className="flex items-center text-gray-600 mb-6">
                  <ScrollText className="h-5 w-5 mr-2 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600 m-0">
                    Tóm tắt
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
                
                <div className="my-8 border-t border-b border-gray-200 py-1"></div>
                
                <div className="flex items-center text-gray-600 mb-6">
                  <ScrollText className="h-5 w-5 mr-2 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600 m-0">
                    Chi tiết sự kiện
                  </h3>
                </div>
                <div className="text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: event.detailedDescription }} />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center text-gray-600 mb-6">
                  <ScrollText className="h-5 w-5 mr-2 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600 m-0">
                    Chi tiết sự kiện
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            )}
            
            {/* Share button */}
            <div className="flex justify-end mt-8">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
            
            {/* Period info card */}
            {period && (
              <motion.div 
                className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-100"
                variants={itemVariants}
              >
                <h2 className="text-xl font-bold text-red-700 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-red-700" />
                  Thời kỳ {period.name}
                </h2>
                
                <div className="mt-4 flex flex-col md:flex-row md:items-start gap-4">
                  {PERIOD_ICONS[period.icon as keyof typeof PERIOD_ICONS] && (
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-red-500 to-amber-500 text-white rounded-full flex items-center justify-center shadow-md">
                      {PERIOD_ICONS[period.icon as keyof typeof PERIOD_ICONS]}
                    </div>
                  )}
                  <div>
                    <p className="mb-2 text-gray-700">{period.description}</p>
                    <p className="text-sm text-gray-600">Khung thời gian: <span className="font-medium">{period.timeframe}</span></p>
                    <div className="mt-4">
                      <Link 
                        href={`/#period-${period.slug}`}
                        onClick={() => {
                          // Phòng trường hợp ID không tồn tại, chuyển đến timeline chung
                          const el = document.getElementById(`period-${period.slug}`);
                          if (!el) {
                            console.log(`Element with ID period-${period.slug} not found, redirecting to timeline`);
                            return window.location.href = '/#timeline';
                          }
                        }}
                      >
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          Xem các sự kiện khác
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { HistoricalFigure, EventData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, Award, ExternalLink, Scroll, Clock, ChevronRight, Info, Share2, HistoryIcon, BookOpen } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function HistoricalFigureDetail() {
  const { figureId } = useParams();
  
  // Fetch the specific historical figure
  const { data: figure, isLoading, error } = useQuery<HistoricalFigure>({
    queryKey: [`/api/historical-figures/${figureId}`],
  });
  
  if (isLoading) {
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
  
  if (error || !figure) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy nhân vật</h1>
          <p className="mb-8 text-gray-700">Nhân vật lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero section */}
      <div className="relative">
        <div className="relative h-[350px] md:h-[450px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/60 to-black/70 z-10"></div>
          <img 
            src={figure.imageUrl || 'https://via.placeholder.com/1200x600?text=Nh%C3%A2n+V%E1%BA%ADt+L%E1%BB%8Bch+S%E1%BB%AD'} 
            alt={figure.name} 
            className="w-full h-full object-cover object-top"
          />
          
          <div className="absolute inset-0 z-20">
            <div className="container mx-auto px-4 h-full flex flex-col justify-between py-8">
              <div>
                <Link href="/#historical-figures">
                  <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Trở về danh sách nhân vật
                  </Button>
                </Link>
              </div>
              
              <div className="max-w-3xl pb-8">
                <Badge className="bg-red-500/70 mb-6 px-3 py-1 text-sm text-white">
                  Nhân vật lịch sử
                </Badge>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-8">
                  {figure.name}
                </motion.h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90 mt-4">
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-2 text-amber-300" />
                    <span>{figure.lifespan}</span>
                  </div>
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 mr-2 text-amber-300" />
                    <span>Thời kỳ {figure.period}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 -mt-16 relative z-10">
          {/* Main content */}
          <motion.div 
            className="md:col-span-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8">
              <motion.div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-red-700 prose-a:text-blue-600"
                variants={itemVariants}
              >
                {figure.detailedDescription ? (
                  <div>
                    <div className="flex items-center text-gray-600 mb-6">
                      <BookOpen className="h-5 w-5 mr-3 text-red-600" />
                      <h3 className="text-xl font-semibold text-red-600 m-0">
                        Tiểu sử
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{figure.description}</p>
                    
                    <div className="my-8 border-t border-b border-gray-200 py-1"></div>
                    
                    <div className="flex items-center text-gray-600 mb-6">
                      <Scroll className="h-5 w-5 mr-3 text-red-600" />
                      <h3 className="text-xl font-semibold text-red-600 m-0">
                        Cuộc đời và sự nghiệp
                      </h3>
                    </div>
                    <div className="text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: figure.detailedDescription || '' }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-gray-600 mb-6">
                      <BookOpen className="h-5 w-5 mr-3 text-red-600" />
                      <h3 className="text-xl font-semibold text-red-600 m-0">
                        Tiểu sử
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{figure.description}</p>
                  </div>
                )}
                
                {/* Share button */}
                <div className="flex justify-end mt-8">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </motion.div>
            </Card>
            
            {/* Achievements section */}
            {figure.achievements && Array.isArray(figure.achievements) && figure.achievements.length > 0 && !Array.isArray(figure.achievements[0]) && (
              <motion.div 
                className="mt-8"
                variants={itemVariants}
              >
                <Card className="bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center text-red-700">
                    <Award className="h-5 w-5 mr-3 text-amber-500" />
                    Thành tựu nổi bật
                  </h3>
                  
                  <ul className="space-y-6 mt-4">
                    {figure.achievements.map((achievement, index) => (
                      <li key={index} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-amber-50 p-2 rounded-full mr-4">
                            <Award className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <div className="font-medium text-lg text-gray-900">{achievement.title}</div>
                            {achievement.year && (
                              <div className="text-sm text-gray-500 mt-1 flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Năm: {achievement.year}
                              </div>
                            )}
                            {achievement.eventId && (
                              <Link href={`/su-kien/${achievement.eventId}/${achievement.title ? slugify(achievement.title) : 'su-kien'}`}>
                                <Button variant="outline" size="sm" className="mt-3 text-red-600 border-red-200 hover:bg-red-50">
                                  Xem sự kiện liên quan
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </motion.div>
          
          {/* Sidebar */}
          <div className="md:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Period info card */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center text-red-700">
                    <HistoryIcon className="h-5 w-5 mr-2 text-red-700" />
                    Thời kỳ liên quan
                  </h3>
                </div>
                
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100 mb-5 flex items-center">
                  <div className="bg-red-500/10 p-3 rounded-full mr-4">
                    <HistoryIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">{figure.period}</h4>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href={`/#period-${slugify(figure.period)}`}>
                    <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50 py-5">
                      Xem thêm về thời kỳ này
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
              
              {/* Additional info/resources card could be added here */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

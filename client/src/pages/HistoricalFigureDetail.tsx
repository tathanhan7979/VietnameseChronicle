import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { HistoricalFigure, EventData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Award, ExternalLink } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function HistoricalFigureDetail() {
  const { figureId } = useParams();
  
  // Fetch the specific historical figure
  const { data: figure, isLoading, error } = useQuery<HistoricalFigure>({
    queryKey: [`/api/historical-figures/${figureId}`],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !figure) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">Không tìm thấy nhân vật</h1>
        <p className="mb-8">Nhân vật lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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
          <Link href="/#historical-figures">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2" />
              Trở về danh sách nhân vật
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero section with image */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img 
              src={figure.imageUrl || 'https://via.placeholder.com/1200x600?text=Nh%C3%A2n+V%E1%BA%ADt+L%E1%BB%8Bch+S%E1%BB%AD'} 
              alt={figure.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] mb-2">{figure.name}</h1>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-white/90">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{figure.lifespan}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Thời kỳ: {figure.period}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-6 md:p-8">
            {/* Description */}
            <div className="prose prose-lg max-w-none">
              {figure.detailedDescription ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
                    Tóm tắt
                  </h3>
                  <p className="text-lg mb-6">{figure.description}</p>
                  
                  <h3 className="text-xl font-semibold my-4 text-[hsl(var(--primary))]">
                    Cuộc đời và sự nghiệp
                  </h3>
                  <div className="text-lg mb-6">
                    <div dangerouslySetInnerHTML={{ __html: figure.detailedDescription || '' }} />
                  </div>
                </div>
              ) : (
                <p className="text-lg mb-6">{figure.description}</p>
              )}
            </div>
            
            {/* Achievements */}
            {figure.achievements && Array.isArray(figure.achievements) && figure.achievements.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))] border-b pb-2">
                  Thành tựu nổi bật
                </h3>
                <ul className="space-y-4 mt-4">
                  {figure.achievements.map((achievement, index) => (
                    <li key={index}>
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-[hsl(var(--secondary))] mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{achievement.title}</div>
                          {achievement.year && <div className="text-sm text-gray-600 mt-1">Năm: {achievement.year}</div>}
                          {achievement.eventId && (
                            <Link href={`/su-kien/${achievement.eventId}/${achievement.title ? slugify(achievement.title) : 'su-kien'}`} className="inline-flex items-center text-[hsl(var(--primary))] text-sm mt-2 hover:underline">
                              Xem sự kiện liên quan
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Period info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-4">Thời kỳ {figure.period}</h2>
              <div>
                <p className="mb-4">Thời gian sống: {figure.lifespan}</p>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    Xem thêm về thời kỳ này
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

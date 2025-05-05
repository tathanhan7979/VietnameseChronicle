import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { HistoricalFigure, EventData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Award, ExternalLink } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ERROR_IMAGE } from "@/lib/constants";
import FacebookComments from "@/components/FacebookComments";

export default function HistoricalFigureDetail() {
  const { figureId } = useParams();

  // Fetch the specific historical figure
  // Lấy dữ liệu nhân vật và các thời kỳ
  // Lấy dữ liệu nhân vật
  const {
    data: figure,
    isLoading,
    error,
  } = useQuery<HistoricalFigure>({
    queryKey: [`/api/historical-figures/${figureId}`],
  });
  
  // Lấy dữ liệu về các thời kỳ
  const { data: periods } = useQuery<{id: number, name: string, slug: string}[]>({
    queryKey: ['/api/periods'],
  });
  
  // Lấy các nhân vật liên quan trong cùng thời kỳ
  const periodId = figure?.periodId;
  
  const { data: relatedFigures = [] } = useQuery<HistoricalFigure[]>({
    queryKey: [`/api/historical-figures/period/${periodId}`],
    enabled: !!periodId
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
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">
          Không tìm thấy nhân vật
        </h1>
        <p className="mb-8">
          Nhân vật lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
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
          <Link href="/nhan-vat/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2" />
              Trở về danh sách nhân vật
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero section with image */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <picture>
              <img
                src={
                  figure.imageUrl ||
                  ERROR_IMAGE
                }
                alt={figure.name}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = ERROR_IMAGE;
                }}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] mb-2">
                  {figure.name}
                </h1>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-white/90">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{figure.lifespan}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <Link href={`/thoi-ky/${periods?.find(p => p.id === figure.periodId)?.slug || ''}`}>
                      <span className="cursor-pointer hover:underline hover:text-white">Thời kỳ: {periods?.find(p => p.id === figure.periodId)?.name || ""}</span>
                    </Link>
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
                    <div
                      dangerouslySetInnerHTML={{
                        __html: figure.detailedDescription || "",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-lg mb-6">{figure.description}</p>
              )}
            </div>

            {/* Achievements */}
            {figure.achievements &&
              Array.isArray(figure.achievements) &&
              figure.achievements.length > 0 &&
              !Array.isArray(figure.achievements[0]) && (
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
                            <div className="font-medium">
                              {achievement.title}
                            </div>
                            {achievement.year && (
                              <div className="text-sm text-gray-600 mt-1">
                                Năm: {achievement.year}
                              </div>
                            )}
                            {achievement.eventId && (
                              <Link
                                href={`/su-kien/${achievement.eventId}/${achievement.title ? slugify(achievement.title) : "su-kien"}`}
                                className="inline-flex items-center text-[hsl(var(--primary))] text-sm mt-2 hover:underline"
                              >
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
              <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-4">
                Thời kỳ {periods?.find(p => p.id === figure.periodId)?.name || ""}
              </h2>
              <div>
                <p className="mb-4">Thời gian sống: {figure.lifespan}</p>
                <Link
                  href={`/thoi-ky/${periods?.find(p => p.id === figure.periodId)?.slug || ""}`}
                >
                  <Button variant="outline" size="sm">
                    Xem thời kỳ {periods?.find(p => p.id === figure.periodId)?.name || ""}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Related Figures - Các nhân vật liên quan cùng thời kỳ */}
            {relatedFigures && relatedFigures.length > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[hsl(var(--primary))] mb-6">Các nhân vật cùng thời kỳ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedFigures
                    .filter(relFigure => relFigure.id !== Number(figureId)) // Loại bỏ nhân vật hiện tại
                    .slice(0, 6) // Giới hạn hiển thị 6 nhân vật
                    .map(relFigure => (
                      <Link href={`/nhan-vat/${relFigure.id}/${slugify(relFigure.name)}`} key={relFigure.id}>
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-48 bg-gray-200 relative">
                            {relFigure.imageUrl ? (
                              <img 
                                src={relFigure.imageUrl} 
                                alt={relFigure.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = ERROR_IMAGE;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <MapPin className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <p className="text-white font-medium">{relFigure.lifespan || 'Không rõ'}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relFigure.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3">{relFigure.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
                {relatedFigures.length > 6 && periods?.find(p => p.id === figure.periodId)?.slug && (
                  <div className="mt-6 text-center">
                    <Link href={`/thoi-ky/${periods?.find(p => p.id === figure.periodId)?.slug}#figures`}>
                      <Button variant="outline">
                        Xem tất cả nhân vật trong thời kỳ {periods?.find(p => p.id === figure.periodId)?.name || ""}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Facebook Comments */}
          <div className="px-6 md:px-8 pb-8">
            <FacebookComments url={window.location.href} />
          </div>
        </div>
      </div>
    </div>
  );
}

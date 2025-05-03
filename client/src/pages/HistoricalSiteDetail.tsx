import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, ArrowLeft, Home, Bookmark, BookmarkCheck, Share, Facebook, Twitter } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";

// Component nút đánh dấu với trạng thái
function BookmarkButton({ siteId, site }: { siteId: number, site: any }) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  
  // Kiểm tra trạng thái bookmark khi component được render
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('historicalSiteBookmarks') || '[]');
    const isMarked = bookmarks.some((bookmark: any) => bookmark.id === siteId);
    setIsBookmarked(isMarked);
  }, [siteId]);
  
  const handleBookmark = () => {
    // Lấy danh sách bookmark hiện tại
    const bookmarks = JSON.parse(localStorage.getItem('historicalSiteBookmarks') || '[]');
    
    if (isBookmarked) {
      // Nếu đã bookmark, xóa khỏi danh sách
      const updatedBookmarks = bookmarks.filter((bookmark: any) => bookmark.id !== siteId);
      localStorage.setItem('historicalSiteBookmarks', JSON.stringify(updatedBookmarks));
      toast({
        title: "Đã xóa khỏi danh sách đánh dấu",
        description: `Di tích ${site.name} đã được xóa khỏi danh sách của bạn.`,
        variant: "destructive",
      });
      setIsBookmarked(false);
    } else {
      // Nếu chưa, thêm vào danh sách
      const bookmark = {
        id: siteId,
        name: site.name,
        location: site.location,
        imageUrl: site.imageUrl,
        slug: slugify(site.name),
        timestamp: new Date().toISOString()
      };
      bookmarks.push(bookmark);
      localStorage.setItem('historicalSiteBookmarks', JSON.stringify(bookmarks));
      toast({
        title: "Đã thêm vào danh sách đánh dấu",
        description: `Di tích ${site.name} đã được lưu lại để xem sau.`,
      });
      setIsBookmarked(true);
    }
  };
  
  return (
    <Button 
      variant={isBookmarked ? "secondary" : "outline"}
      size="sm" 
      className={`flex items-center justify-center ${isBookmarked ? 'bg-amber-100 text-amber-700' : ''}`}
      onClick={handleBookmark}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 mr-2 text-amber-700" />
      ) : (
        <Bookmark className="w-4 h-4 mr-2" />
      )}
      {isBookmarked ? 'Đã lưu' : 'Đánh dấu'}
    </Button>
  );
}

// Component nút chia sẻ
function ShareButton({ site }: { site: any }) {
  const { toast } = useToast();
  
  const handleShare = async () => {
    // Tạo URL chia sẻ
    const currentUrl = window.location.href;
    const text = `Khám phá di tích lịch sử: ${site.name}`;
    
    // Mở hộp thoại chia sẻ
    if (navigator.share) {
      try {
        await navigator.share({
          title: site.name,
          text: text,
          url: currentUrl
        });
        toast({
          title: "Chia sẻ thành công",
          description: "Liên kết đã được chia sẻ."
        });
      } catch (error) {
        console.log('Lỗi khi chia sẻ:', error);
      }
    } else {
      // Sao chép URL vào clipboard nếu Web Share API không khả dụng
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast({
          title: "Đã sao chép liên kết",
          description: "Liên kết đã được sao chép vào clipboard."
        });
      } catch (error) {
        console.error('Lỗi khi sao chép:', error);
        toast({
          title: "Lỗi khi sao chép",
          description: "Không thể sao chép liên kết. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center justify-center"
      onClick={handleShare}
    >
      <Share className="w-4 h-4 mr-2" />
      Chia sẻ
    </Button>
  );
}

export default function HistoricalSiteDetail() {
  // Trạng thái của component
  const [site, setSite] = useState<any>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Hooks
  const params = useParams<{ id: string; slug?: string }>();
  const [, setLocation] = useLocation();
  const siteId = parseInt(params.id, 10);

  // Tải dữ liệu khi component được render
  useEffect(() => {
    const fetchData = async () => {
      if (isNaN(siteId)) {
        setError(new Error("ID không hợp lệ"));
        setIsLoading(false);
        return;
      }

      try {
        // 1. Tải thông tin di tích
        const siteResponse = await fetch(`${API_ENDPOINTS.HISTORICAL_SITES}/${siteId}`);
        if (!siteResponse.ok) {
          throw new Error('Lỗi khi tải dữ liệu di tích');
        }
        const siteData = await siteResponse.json();
        setSite(siteData);

        // 2. Tải thông tin thời kỳ nếu di tích có liên kết với thời kỳ
        if (siteData.periodId) {
          const periodsResponse = await fetch(API_ENDPOINTS.PERIODS);
          if (periodsResponse.ok) {
            const periodsData = await periodsResponse.json();
            const foundPeriod = periodsData.find((p: any) => p.id === siteData.periodId);
            if (foundPeriod) {
              setPeriod(foundPeriod.name);
            }
          }
        }

        // 3. Chuyển hướng URL thân thiện nếu slug không đúng
        if (siteData.name) {
          const correctSlug = slugify(siteData.name);
          if (!params.slug && correctSlug) {
            setLocation(`/di-tich/${siteId}/${correctSlug}`, { replace: true });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Lỗi:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [siteId, params.slug, setLocation]);

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-6" />
            <Skeleton className="h-32 w-full mb-4" />
          </div>
          <div>
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error || !site) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Đã xảy ra lỗi</h1>
        <p className="mb-6">Không thể tải thông tin di tích lịch sử. Vui lòng thử lại sau.</p>
        <Button onClick={() => setLocation('/')}>
          <Home className="mr-2 h-4 w-4" /> Về trang chủ
        </Button>
      </div>
    );
  }

  // Hiển thị thông tin di tích
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header area with image background */}
      <div className="relative">
        {site.imageUrl && (
          <div className="absolute inset-0 z-0 h-[350px] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
              src={site.imageUrl} 
              alt={site.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        {/* Content overlay */}
        <div className="container mx-auto relative z-20 pt-12 px-4">
          <Button 
            variant="outline" 
            className="mb-6 bg-white/90 hover:bg-white"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>

          <div className="pb-16 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">{site.name}</h1>
            
            <div className="flex flex-wrap gap-2 items-center">
              {period && (
                <Badge className="bg-primary/90 hover:bg-primary text-white px-3 py-1 text-sm">
                  {period}
                </Badge>
              )}
              {site.yearBuilt && (
                <Badge variant="outline" className="bg-white/70 hover:bg-white px-3 py-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  {site.yearBuilt}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/70 hover:bg-white px-3 py-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {site.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột thông tin chi tiết */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6 pb-4 border-b text-primary">Giới thiệu</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert prose-img:rounded-md prose-headings:text-primary prose-a:text-blue-600">
                <p className="text-gray-700 leading-relaxed">{site.description}</p>

                {site.detailedDescription && (
                  <div 
                    className="mt-8" 
                    dangerouslySetInnerHTML={{ __html: site.detailedDescription }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Cột thông tin bổ sung */}
          <div>
            <Card className="p-6 shadow-md bg-white">
              <h3 className="text-xl font-semibold mb-6 pb-3 border-b">Thông tin chi tiết</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Địa điểm</h4>
                    <p className="text-gray-700">{site.location}</p>
                    {site.address && <p className="text-sm text-gray-600 mt-1">{site.address}</p>}
                  </div>
                </div>

                {site.yearBuilt && (
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Năm xây dựng</h4>
                      <p className="text-gray-700">{site.yearBuilt}</p>
                    </div>
                  </div>
                )}
                
                {/* Google Maps button */}
                {site.mapUrl && (
                  <div className="mt-8">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(site.mapUrl, '_blank')}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Xem trên Google Maps
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Chia sẻ mạng xã hội và đánh dấu */}
            <Card className="p-6 shadow-md bg-white mt-6">
              <h3 className="text-lg font-semibold mb-4">Tương tác</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <ShareButton site={site} />
                <BookmarkButton siteId={site.id} site={site} />
              </div>
              
              {/* Các nút mạng xã hội */}
              <div className="flex justify-center space-x-4 pt-2 border-t">
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  onClick={() => {
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                    window.open(facebookUrl, '_blank', 'width=600,height=400');
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </button>
                <button 
                  className="p-2 text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
                  onClick={() => {
                    const twitterText = `Khám phá di tích lịch sử: ${site.name}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(window.location.href)}`;
                    window.open(twitterUrl, '_blank', 'width=600,height=400');
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </button>
                <button 
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  onClick={() => {
                    // Tạo tin nhắn WhatsApp
                    const text = `Khám phá di tích lịch sử: ${site.name} ${window.location.href}`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                  </svg>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

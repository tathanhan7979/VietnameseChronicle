import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, ArrowLeft, Home, Share2, Bookmark } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaPinterest, FaReddit } from "react-icons/fa";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "../lib/utils";

export default function HistoricalSiteDetail() {
  // Trạng thái của component
  const [site, setSite] = useState<any>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  // Toggle bookmark/favorite status
  const toggleFavorite = () => {
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    // Save to localStorage
    const savedFavorites = localStorage.getItem('favoriteSites');
    let favorites: number[] = [];
    
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
    }
    
    if (newStatus) {
      // Add to favorites if not already present
      if (!favorites.includes(siteId)) {
        favorites.push(siteId);
      }
    } else {
      // Remove from favorites
      favorites = favorites.filter(id => id !== siteId);
    }
    
    localStorage.setItem('favoriteSites', JSON.stringify(favorites));
  };

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
              
              // 2.1 Tải các di tích khác trong cùng thời kỳ sử dụng slug
              // Sử dụng API endpoint mới cho slug của thời kỳ
              if (foundPeriod.slug) {
                try {
                  const relatedSitesResponse = await fetch(`/api/periods-slug/${foundPeriod.slug}/historical-sites`);
                  if (relatedSitesResponse.ok) {
                    // Có thể xử lý dữ liệu di tích liên quan ở đây nếu cần
                    console.log('Đã tải các di tích liên quan thành công');
                  }
                } catch (err) {
                  console.error('Lỗi khi tải di tích liên quan:', err);
                }
              }
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

        // 4. Kiểm tra trạng thái yêu thích
        const savedFavorites = localStorage.getItem('favoriteSites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          if (favorites.includes(siteId)) {
            setIsFavorite(true);
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

            {/* Chia sẻ và đánh dấu */}
            <Card className="p-6 shadow-md bg-white mt-6">
              <h3 className="text-lg font-semibold mb-4">Tác vụ</h3>
              
              {/* Đánh dấu Bookmark */}
              <Button 
                variant={isFavorite ? "default" : "outline"}
                size="sm" 
                className="w-full flex items-center justify-center mb-4"
                onClick={toggleFavorite}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Đã lưu' : 'Đánh dấu vào yêu thích'}
              </Button>
              
              {/* Bookmark trình duyệt */}
              <Button 
                variant="outline"
                size="sm" 
                className="w-full flex items-center justify-center mb-4"
                onClick={() => {
                  // Modern browsers don't support these legacy methods anymore
                  // Using simple alert instead
                  alert('Để lưu trang này, hãy nhấn ' + 
                    (navigator.userAgent.toLowerCase().indexOf('mac') !== -1 ? 'Command/Cmd' : 'Ctrl') + 
                    '+D trên bàn phím.');
                }}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Đánh dấu trình duyệt
              </Button>
              
              <Separator className="my-4" />
              
              {/* Chia sẻ */}
              <h4 className="text-sm font-medium mb-3">Chia sẻ lên mạng xã hội</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {/* Facebook */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#3b5998] hover:bg-[#3b5998]/90 text-white rounded-full w-10 h-10 p-2"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  <FaFacebook className="w-5 h-5" />
                </Button>
                
                {/* Twitter */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white rounded-full w-10 h-10 p-2"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(site.name)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  <FaTwitter className="w-5 h-5" />
                </Button>
                
                {/* LinkedIn */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white rounded-full w-10 h-10 p-2"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  <FaLinkedin className="w-5 h-5" />
                </Button>
                
                {/* Pinterest */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#E60023] hover:bg-[#E60023]/90 text-white rounded-full w-10 h-10 p-2"
                  onClick={() => {
                    const media = site.imageUrl ? `&media=${encodeURIComponent(site.imageUrl)}` : '';
                    window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(site.name)}${media}`, '_blank');
                  }}
                >
                  <FaPinterest className="w-5 h-5" />
                </Button>
                
                {/* Reddit */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white rounded-full w-10 h-10 p-2"
                  onClick={() => window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(site.name)}`, '_blank')}
                >
                  <FaReddit className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Copy link */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Đường dẫn đã được sao chép!'))
                    .catch(err => console.error('Không thể sao chép đường dẫn', err));
                }}
              >
                <Share2 className="mr-2 h-4 w-4" /> Sao chép liên kết
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

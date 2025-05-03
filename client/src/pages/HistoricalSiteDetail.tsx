import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, ArrowLeft, Home } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "../lib/utils";

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
    <div className="container mx-auto py-8 px-4">
      {/* Nút quay lại */}
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <h1 className="text-3xl font-bold mb-6 text-primary">{site.name}</h1>
      
      {/* Thẻ ghi thời kỳ nếu có */}
      {period && (
        <Badge variant="outline" className="mb-4">
          {period}
        </Badge>
      )}

      {/* Ảnh chính */}
      {site.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg shadow-md">
          <img 
            src={site.imageUrl} 
            alt={site.name} 
            className="w-full h-[500px] object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột thông tin chi tiết */}
        <div className="md:col-span-2">
          <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
            <h2 className="text-2xl font-semibold mb-4">Giới thiệu</h2>
            <p>{site.description}</p>

            {site.detailedDescription && (
              <div 
                className="mt-6" 
                dangerouslySetInnerHTML={{ __html: site.detailedDescription }}
              />
            )}
          </div>
        </div>

        {/* Cột thông tin bổ sung */}
        <div>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Thông tin</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-medium">Địa điểm</h4>
                  <p>{site.location}</p>
                  {site.address && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{site.address}</p>}
                </div>
              </div>

              {site.yearBuilt && (
                <div className="flex items-start">
                  <CalendarDays className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <h4 className="font-medium">Năm xây dựng</h4>
                    <p>{site.yearBuilt}</p>
                  </div>
                </div>
              )}
              
              {/* Thêm nút xem bản đồ */}
              {site.mapUrl && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => window.open(site.mapUrl, '_blank')}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Xem trên bản đồ
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

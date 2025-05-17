import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Kiểu dữ liệu cho tin tức
interface News {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  viewCount: number;
  periodId: number | null;
  eventId: number | null;
  historicalFigureId: number | null;
  historicalSiteId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export default function NewsSection() {
  const [activeTab, setActiveTab] = useState("featured");

  // Query để lấy tin tức nổi bật
  const { data: featuredNews, isLoading: isLoadingFeatured } = useQuery<News[]>({
    queryKey: ["/api/news/featured"],
    queryFn: async () => {
      const response = await fetch("/api/news/featured");
      if (!response.ok) throw new Error("Failed to fetch featured news");
      return response.json();
    },
  });

  // Query để lấy tin tức mới nhất
  const { data: latestNews, isLoading: isLoadingLatest } = useQuery<News[]>({
    queryKey: ["/api/news/latest"],
    queryFn: async () => {
      const response = await fetch("/api/news/latest");
      if (!response.ok) throw new Error("Failed to fetch latest news");
      return response.json();
    },
  });

  // Query để lấy tin tức phổ biến nhất
  const { data: popularNews, isLoading: isLoadingPopular } = useQuery<News[]>({
    queryKey: ["/api/news/popular"],
    queryFn: async () => {
      const response = await fetch("/api/news/popular");
      if (!response.ok) throw new Error("Failed to fetch popular news");
      return response.json();
    },
  });

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM, yyyy", { locale: vi });
    } catch (error) {
      return "Không xác định";
    }
  };

  // Xử lý hiển thị tiêu đề dài
  const truncateTitle = (title: string, maxLength = 70) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Render một card tin tức
  const renderNewsCard = (news: News) => (
    <Card key={news.id} className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={news.imageUrl || "https://lichsuviet.edu.vn/uploads/banner-image.png"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2 flex-grow">
        <CardTitle className="text-xl mb-2">
          <Link href={`/tin-tuc/${news.id}/${news.slug}`} className="hover:text-primary">
            {truncateTitle(news.title)}
          </Link>
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {formatDate(news.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-gray-700 line-clamp-3">{news.summary}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/tin-tuc/${news.id}/${news.slug}`} className="text-primary hover:underline text-sm font-medium">
          Đọc tiếp
        </Link>
        <div className="ml-auto text-sm text-gray-500">
          {news.viewCount} lượt xem
        </div>
      </CardFooter>
    </Card>
  );

  // Hiển thị phần loading
  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full flex flex-col">
          <div className="relative overflow-hidden h-48 bg-gray-200 animate-pulse" />
          <CardHeader className="pb-2">
            <div className="h-6 w-4/5 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-4/6 bg-gray-200 animate-pulse rounded" />
          </CardContent>
          <CardFooter className="pt-0">
            <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <section id="news" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tin Tức & Bài Viết</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật những tin tức, bài viết mới nhất về lịch sử Việt Nam, các sự kiện, nhân vật và di tích lịch sử.
          </p>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="featured" onClick={() => setActiveTab("featured")}>
                Nổi Bật
              </TabsTrigger>
              <TabsTrigger value="latest" onClick={() => setActiveTab("latest")}>
                Mới Nhất
              </TabsTrigger>
              <TabsTrigger value="popular" onClick={() => setActiveTab("popular")}>
                Phổ Biến
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="featured">
            {isLoadingFeatured ? (
              renderLoading()
            ) : featuredNews && featuredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredNews.map(renderNewsCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có tin tức nổi bật.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="latest">
            {isLoadingLatest ? (
              renderLoading()
            ) : latestNews && latestNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestNews.map(renderNewsCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có tin tức mới.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular">
            {isLoadingPopular ? (
              renderLoading()
            ) : popularNews && popularNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {popularNews.map(renderNewsCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có tin tức phổ biến.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Link href="/tin-tuc" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Xem Tất Cả Tin Tức
          </Link>
        </div>
      </div>
    </section>
  );
}
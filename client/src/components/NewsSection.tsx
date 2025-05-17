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
import { Calendar, ArrowRight, Eye, BookOpen } from "lucide-react";

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
  // Chỉ lấy tin tức mới nhất
  const { data: latestNews, isLoading: isLoadingLatest } = useQuery<News[]>({
    queryKey: ["/api/news/latest"],
    queryFn: async () => {
      const response = await fetch("/api/news/latest");
      if (!response.ok) throw new Error("Failed to fetch latest news");
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
  const renderNewsCard = (news: News, index: number) => (
    <Card 
      key={news.id} 
      className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-300"
    >
      <div className="relative overflow-hidden h-52 md:h-56 lg:h-60">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <img
          src={news.imageUrl || "https://lichsuviet.edu.vn/uploads/banner-image.png"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/uploads/error-img.png";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute top-3 right-3 z-20">
          {index === 0 && (
            <span className="bg-amber-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Mới nhất
            </span>
          )}
        </div>
      </div>
      <CardHeader className="pb-2 flex-grow bg-gradient-to-b from-amber-50/50 to-transparent">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="w-3.5 h-3.5 mr-1 text-amber-600" />
          {formatDate(news.createdAt)}
          <div className="ml-auto flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>{news.viewCount}</span>
          </div>
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-amber-900 leading-tight transition-colors group-hover:text-amber-700">
          <Link href={`/tin-tuc/${news.id}/${news.slug}`} className="hover:text-amber-600">
            {truncateTitle(news.title)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-gray-600 line-clamp-3">{news.summary}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          href={`/tin-tuc/${news.id}/${news.slug}`} 
          className="flex items-center text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
        >
          Đọc tiếp <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );

  // Hiển thị phần loading
  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full flex flex-col overflow-hidden">
          <div className="relative overflow-hidden h-52 md:h-56 lg:h-60 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <CardHeader className="pb-2 bg-gradient-to-b from-amber-50/30 to-transparent">
            <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded mb-3" />
            <div className="h-6 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded mb-1" />
            <div className="h-6 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded mb-2" />
            <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded mb-2" />
            <div className="h-4 w-4/6 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded" />
          </CardContent>
          <CardFooter className="pt-0">
            <div className="h-4 w-1/4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <section id="news" className="py-16 bg-amber-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-3">
            <BookOpen className="h-8 w-8 text-amber-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 relative inline-block">
              Tin Tức & Bài Viết
            </h2>
            <BookOpen className="h-8 w-8 text-amber-600 ml-3" />
          </div>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật những tin tức, bài viết mới nhất về lịch sử Việt Nam, các sự kiện, nhân vật và di tích lịch sử.
          </p>
        </div>

        {isLoadingLatest ? (
          renderLoading()
        ) : latestNews && latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((news, index) => renderNewsCard(news, index))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto text-amber-300 mb-3" />
            <p className="text-gray-500">Không có tin tức mới.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link 
            href="/tin-tuc" 
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg group"
          >
            <span>Xem Tất Cả Tin Tức</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
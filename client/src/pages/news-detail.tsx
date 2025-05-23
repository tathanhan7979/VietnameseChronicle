import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Clock,
  MapPin,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import FacebookComments from "@/components/FacebookComments";
import { formatDate } from "@/lib/utils";

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
  is_featured: boolean;
  period?: {
    id: number;
    name: string;
    slug: string;
  };
  event?: {
    id: number;
    name: string;
    slug: string;
  };
  historicalFigure?: {
    id: number;
    name: string;
    slug: string;
  };
  historicalSite?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface RelatedNews {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
}

const NewsDetailPage: React.FC = () => {
  const params = useParams<{ id: string; slug?: string }>();
  const newsId = parseInt(params.id, 10);
  const [location, setLocation] = useLocation();

  // Fetch chi tiết tin tức
  const {
    data: news,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/news", newsId],
    queryFn: async () => {
      const response = await fetch(`/api/news/${newsId}`);
      if (!response.ok) {
        throw new Error("Không thể tải tin tức");
      }
      return response.json();
    },
    enabled: !!newsId && !isNaN(newsId),
  });

  // Fetch tin tức liên quan - dùng relatedNews từ API
  const { data: relatedNews } = useQuery({
    queryKey: ["/api/news/related", newsId],
    queryFn: async () => {
      if (news?.relatedNews) {
        return news.relatedNews;
      }
      return [];
    },
    enabled: !!news?.news,
  });

  // Tăng lượt xem khi người dùng xem tin tức
  useEffect(() => {
    if (newsId && !isNaN(newsId)) {
      fetch(`/api/news/${newsId}/view`, { method: "POST" }).catch((error) =>
        console.error("Error incrementing view count:", error),
      );
    }
  }, [newsId]);

  // Điều hướng đến URL đúng nếu slug không khớp
  useEffect(() => {
    if (news?.news && params.slug !== news.news.slug) {
      setLocation(`/tin-tuc/${news.news.id}/${news.news.slug}`);
    }
  }, [news, params.slug, setLocation]);

  // Hiển thị nội dung HTML từ rich text editor
  const renderContent = (content: string) => {
    return { __html: content };
  };

  // Nếu đang tải
  if (isLoading) {
    return (
      <>
        <Header onOpenSearch={() => {}} />
        <main className="container mx-auto px-4 py-12 pt-24 md:pt-28">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Nếu có lỗi
  if (error || !news) {
    return (
      <>
        <Header onOpenSearch={() => {}} />
        <main className="container mx-auto mt-6 px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Không tìm thấy tin tức
          </h1>
          <p className="text-gray-600 mb-6">
            Tin tức này không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/tin-tuc">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách tin tức
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // URL đầy đủ cho Facebook comments
  const fullUrl =
    typeof window !== "undefined" && news?.news
      ? `${window.location.origin}/tin-tuc/${news.news.id}/${news.news.slug}`
      : "";

  return (
    <>
      {news?.news && (
        <SEO
          title={`${news.news.title} | Lịch Sử Việt Nam`}
          description={news.news.summary}
          image={
            news.news.imageUrl ||
            "https://lichsuviet.edu.vn/uploads/banner-image.png"
          }
          type="article"
          url={`/tin-tuc/${news.news.id}/${news.news.slug}`}
          articlePublishedTime={news.news.createdAt}
          articleModifiedTime={news.news.updatedAt || news.news.createdAt}
        />
      )}

      <Header onOpenSearch={() => {}} />

      <main className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/">
              <span className="hover:text-amber-600 transition-colors">
                Trang chủ
              </span>
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tin-tuc">
              <span className="hover:text-amber-600 transition-colors">
                Tin tức
              </span>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-amber-600 truncate max-w-[200px]">
              {news?.news?.title}
            </span>
          </div>

          {/* Tiêu đề và thông tin */}
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-5 leading-tight">
            {news?.news?.title}
          </h1>

          <div className="border-b border-amber-100 pb-5 mb-8">
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-3 mb-4">
              <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full shadow-sm">
                <Calendar className="w-4 h-4 mr-1.5 text-amber-600" />
                {news?.news ? formatDate(news.news.createdAt) : ""}
              </div>

              <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full shadow-sm">
                <Eye className="w-4 h-4 mr-1.5 text-amber-600" />
                {news?.news?.viewCount} lượt xem
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {news?.news?.period && (
                <Link href={`/thoi-ky/${news.news.period.slug}`}>
                  <span className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-md hover:shadow-md transition-all border border-amber-200 hover:border-amber-300">
                    <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
                    <span className="font-medium">{news.news.period.name}</span>
                  </span>
                </Link>
              )}

              {news?.news?.historicalFigure && (
                <Link
                  href={`/nhan-vat/${news.news.historicalFigure.id}/${news.news.historicalFigure.slug}`}
                >
                  <span className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-md hover:shadow-md transition-all border border-amber-200 hover:border-amber-300">
                    <User className="w-4 h-4 mr-1.5 text-amber-600" />
                    <span className="font-medium">
                      {news.news.historicalFigure.name}
                    </span>
                  </span>
                </Link>
              )}

              {news?.news?.historicalSite && (
                <Link
                  href={`/di-tich/${news.news.historicalSite.id}/${news.news.historicalSite.slug}`}
                >
                  <span className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-md hover:shadow-md transition-all border border-amber-200 hover:border-amber-300">
                    <MapPin className="w-4 h-4 mr-1.5 text-amber-600" />
                    <span className="font-medium">
                      {news.news.historicalSite.name}
                    </span>
                  </span>
                </Link>
              )}

              {news?.news?.event && (
                <Link
                  href={`/su-kien/${news.news.event.id}/${news.news.event.slug}`}
                >
                  <span className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-md hover:shadow-md transition-all border border-amber-200 hover:border-amber-300">
                    <BookOpen className="w-4 h-4 mr-1.5 text-amber-600" />
                    <span className="font-medium">{news.news.event.name}</span>
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Chia bố cục thành 2 cột trên màn hình lớn */}
          <div className="lg:flex lg:gap-8">
            <div className="lg:w-2/3">
              {/* Hình ảnh chính */}
              {news?.news?.imageUrl && (
                <div className="mb-8 overflow-hidden rounded-xl shadow-md relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={news.news.imageUrl}
                    alt={news.news.title}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/error-img.png";
                      e.currentTarget.onerror = null; // Tránh lặp vô hạn nếu error-img.png cũng lỗi
                    }}
                  />
                </div>
              )}

              {/* Tóm tắt */}
              {news?.news?.summary && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 p-5 mb-8 italic text-amber-800 rounded-r-lg shadow-sm text-lg">
                  {news.news.summary}
                </div>
              )}

              {/* Nội dung chính */}
              {news?.news?.content && (
                <div
                  className="prose prose-amber prose-lg max-w-none mb-12 prose-headings:text-amber-900 prose-a:text-amber-700 prose-a:no-underline hover:prose-a:text-amber-600 prose-img:rounded-lg prose-img:shadow-md prose-p:leading-relaxed prose-p:text-gray-700 prose-li:text-gray-700 prose-h2:border-b prose-h2:border-amber-200 prose-h2:pb-2 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic"
                  dangerouslySetInnerHTML={renderContent(news.news.content)}
                />
              )}
            </div>

            <div className="lg:w-1/3 mt-8 lg:mt-0">
              {/* Phần sidebar bên phải với thông tin và tin liên quan - sẽ cuộn theo khi người dùng cuộn trang */}
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* Thẻ tác giả hoặc thông tin bổ sung */}
                <div className="bg-amber-50 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">
                    Thông tin bài viết
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                      <span>
                        Đăng ngày:{" "}
                        {news?.news ? formatDate(news.news.createdAt) : ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-amber-600" />
                      <span>Lượt xem: {news?.news?.viewCount}</span>
                    </div>

                    {news?.news?.period && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-amber-600" />
                        <span>Thời kỳ: {news.news.period.name}</span>
                      </div>
                    )}

                    {news?.news?.event && (
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                        <span>Sự kiện: {news.news.event.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hiển thị tin tức liên quan nếu có */}
                {relatedNews && relatedNews.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md border border-amber-200">
                    <div className="p-4 border-b border-amber-200 bg-amber-100">
                      <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                        Tin tức liên quan
                      </h3>
                    </div>
                    <div className="p-4 max-h-[1200px] custom-scrollbar">
                      {relatedNews
                        .slice(0, 8)
                        .map((item: RelatedNews, index: number) => (
                          <Link
                            key={item.id}
                            href={`/tin-tuc/${item.id}/${item.slug}`}
                          >
                            <div
                              className={`flex items-start gap-3 group hover:bg-amber-50 p-3 rounded-lg transition-all ${index < relatedNews.slice(0, 8).length - 1 ? "border-b border-amber-100 pb-3 mb-3" : ""}`}
                            >
                              <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm bg-amber-100 relative">
                                {item.imageUrl ? (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/uploads/error-img.png";
                                        e.currentTarget.onerror = null;
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-amber-700" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-amber-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight">
                                  {item.title}
                                </h4>
                                <div className="text-xs text-gray-500 mt-2 flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1 text-amber-500" />
                                  {formatDate(item.createdAt)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Facebook comments */}
          <div className="border-t border-gray-200 pt-8 mt-8 mb-8">
            <h3 className="text-xl font-semibold text-amber-900 mb-4">
              Bình luận
            </h3>
            {fullUrl && <FacebookComments url={fullUrl} />}
          </div>

          {/* Tin tức có thể bạn quan tâm */}
          {relatedNews && relatedNews.length > 3 && (
            <div className="border-t border-gray-200 pt-8 mb-12 lg:hidden">
              <h3 className="text-xl font-semibold text-amber-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                Có thể bạn quan tâm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedNews.slice(0, 4).map((item: RelatedNews) => (
                  <Link key={item.id} href={`/tin-tuc/${item.id}/${item.slug}`}>
                    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md hover:border-amber-200 border border-transparent transition-all duration-300 overflow-hidden">
                      <div className="aspect-[16/9] overflow-hidden bg-amber-100">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = "/uploads/error-img.png";
                              e.currentTarget.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-200 text-amber-700">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          {formatDate(item.createdAt)}
                        </div>
                        <h4 className="font-medium text-amber-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nút quay lại */}
          <div className="mt-12 border-t border-gray-200 pt-6">
            <Link href="/tin-tuc">
              <Button variant="outline" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại danh sách tin tức
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </>
  );
};

export default NewsDetailPage;

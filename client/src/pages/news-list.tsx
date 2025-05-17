import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Helmet } from "react-helmet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search, ArrowRight, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
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
}

const NewsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const limit = 12;

  // Fetch tất cả tin tức với phân trang
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ["/api/news", page, limit, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Không thể tải tin tức");
      }
      return response.json();
    },
  });

  // Xử lý cấu trúc dữ liệu API
  const newsData = apiResponse?.data || [];
  const totalItems = apiResponse?.total ? parseInt(apiResponse.total) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const totalPages = Math.ceil(totalItems / limit);

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisiblePages);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (page > 1) setPage(page - 1);
          }}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Ellipsis after first page
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <span className="px-4 py-2">...</span>
          </PaginationItem>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis before last page
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <span className="px-4 py-2">...</span>
        </PaginationItem>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(totalPages);
            }}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (page < totalPages) setPage(page + 1);
          }}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return <PaginationContent>{items}</PaginationContent>;
  };

  return (
    <>
      <SEO
        title="Tin tức | Lịch Sử Việt Nam"
        description="Cập nhật tin tức, bài viết mới nhất về lịch sử Việt Nam từ các thời kỳ, sự kiện và nhân vật lịch sử."
        url="/tin-tuc"
      />
      <Header onOpenSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        {/* Điều hướng về trang chủ */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/">
            <span className="hover:text-amber-600 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Trang chủ
            </span>
          </Link>
          <span className="mx-2">/</span>
          <span className="text-amber-600">Tin tức</span>
        </div>

        <h1 className="text-3xl font-bold text-amber-900 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Tin tức & Bài viết
        </h1>
        
        {/* Thanh tìm kiếm và lọc */}
        <div className="bg-amber-50 p-4 rounded-lg mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          </form>
        </div>
        
        {/* Danh sách tin tức */}
        {isLoading ? (
          <div className="grid place-items-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>Đã xảy ra lỗi khi tải tin tức. Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {newsData.map((news: News) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="aspect-[16/9] overflow-hidden bg-amber-100 relative">
                    {news.imageUrl ? (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/uploads/error-img.png";
                          e.currentTarget.onerror = null; // Tránh lặp vô hạn nếu error-img.png cũng lỗi
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-200 text-amber-700">
                        <img src="/uploads/error-img.png" alt="Không có hình ảnh" className="w-16 h-16 opacity-60" />
                      </div>
                    )}
                    {news.is_featured && (
                      <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
                        Nổi bật
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(news.createdAt)}
                      
                      <div className="ml-auto flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{news.viewCount}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight line-clamp-2">
                      <Link href={`/tin-tuc/${news.id}/${news.slug}`} className="hover:text-amber-700 transition-colors">
                        {news.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {news.summary}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Link href={`/tin-tuc/${news.id}/${news.slug}`}>
                      <Button variant="link" className="p-0 h-auto text-amber-600 hover:text-amber-700 group-hover:translate-x-1 transition-transform">
                        Đọc thêm <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Không có kết quả */}
            {newsData.length === 0 && (
              <div className="text-center py-10 bg-amber-50 rounded-lg">
                <p className="text-lg text-amber-800 mb-2">Không tìm thấy tin tức nào</p>
                <p className="text-sm text-muted-foreground">Vui lòng thử tìm kiếm với từ khóa khác.</p>
              </div>
            )}
            
            {/* Phân trang */}
            {newsData.length > 0 && (
              <Pagination className="mt-8">
                {renderPagination()}
              </Pagination>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default NewsListPage;
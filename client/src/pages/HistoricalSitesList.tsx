import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { HistoricalSite } from '../lib/types';
import { API_ENDPOINTS, DEFAULT_IMAGE, ERROR_IMAGE } from '../lib/constants';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MapPin, Calendar, Info, Search, Bookmark, Share2, Filter, MapIcon, LayoutGrid, ArrowLeft } from "lucide-react";
import { slugify } from "../lib/utils";

export default function HistoricalSitesList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteSites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteSites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch all historical sites
  const { isLoading: sitesLoading, error: sitesError, data: sites } = useQuery<HistoricalSite[]>({
    queryKey: [API_ENDPOINTS.HISTORICAL_SITES],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.HISTORICAL_SITES);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  // Fetch all periods (for filtering)
  const { data: periods } = useQuery<any[]>({
    queryKey: [API_ENDPOINTS.PERIODS],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.PERIODS);
      if (!response.ok) {
        throw new Error('Failed to fetch periods');
      }
      return response.json();
    }
  });

  // Toggle a site as favorite
  const toggleFavorite = (siteId: number) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(siteId)) {
        return prevFavorites.filter(id => id !== siteId);
      } else {
        return [...prevFavorites, siteId];
      }
    });
  };

  // Share a site
  const shareSite = (site: HistoricalSite) => {
    if (navigator.share) {
      navigator.share({
        title: site.name,
        text: site.description,
        url: `${window.location.origin}/di-tich/${site.id}/${slugify(site.name)}`
      })
      .catch(err => console.log('Error sharing', err));
    } else {
      // Fallback - copy to clipboard
      const url = `${window.location.origin}/di-tich/${site.id}/${slugify(site.name)}`;
      navigator.clipboard.writeText(url)
      .then(() => alert('Đường dẫn đã được sao chép!'))
      .catch(err => console.error('Không thể sao chép đường dẫn', err));
    }
  };

  // Filter and search sites
  const filteredSites = sites?.filter(site => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply period filter
    const matchesPeriod = periodFilter === 'all' || site.periodId === parseInt(periodFilter);

    return matchesSearch && matchesPeriod;
  }) || [];

  // Sort sites with favorites at the top
  const sortedSites = [...filteredSites].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.id);
    const bIsFavorite = favorites.includes(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  // Filter just favorite sites
  const favoriteSites = filteredSites.filter(site => favorites.includes(site.id));

  if (sitesLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h1>
        <p className="mb-6">Không thể tải dữ liệu di tích lịch sử. Vui lòng thử lại sau.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Back to home button */}
      <div className="container mx-auto px-4 pt-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600 hover:text-[#ffffff] mb-4 hover:bg-[#C62828]"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Trở về trang chủ
        </Button>
      </div>
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="container mx-auto px-4">

          <h1 className="text-4xl font-bold mb-4">Di Tích Lịch Sử Việt Nam</h1>
          <p className="text-lg max-w-3xl mb-8">
            Khám phá di sản văn hóa đa dạng của Việt Nam qua những công trình kiến trúc,
            đền đài, lăng tẩm có giá trị lịch sử, văn hóa, và khoa học.
          </p>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <Input 
                placeholder="Tìm kiếm di tích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-white/20 bg-white/10 text-white placeholder:text-white/60 w-full"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="h-5 w-5" />
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[180px] border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Thời kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời kỳ</SelectItem>
                  {periods?.map(period => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 ml-auto">
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 -mt-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white shadow-md rounded-t-xl w-full md:w-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              Tất cả di tích ({filteredSites.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 md:flex-none">
              Đã đánh dấu ({favoriteSites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredSites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">Không tìm thấy di tích phù hợp với điều kiện tìm kiếm.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedSites.map(site => (
                  <SiteCard 
                    key={site.id} 
                    site={site} 
                    isFavorite={favorites.includes(site.id)}
                    onToggleFavorite={() => toggleFavorite(site.id)}
                    onShare={() => shareSite(site)}
                    onClick={() => navigate(`/di-tich/${site.id}/${slugify(site.name)}`)}
                    periodName={periods?.find(p => p.id === site.periodId)?.name || ''}
                    periodSlug={periods?.find(p => p.id === site.periodId)?.slug}
                    onPeriodClick={(slug) => navigate(`/thoi-ky/${slug}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">Tính năng xem bản đồ sẽ sớm được cập nhật.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            {favoriteSites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">Bạn chưa đánh dấu di tích nào.</p>
                <p className="text-sm text-gray-400 mt-2">Nhấn vào biểu tượng đánh dấu để lưu di tích yêu thích.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favoriteSites.map(site => (
                  <SiteCard 
                    key={site.id} 
                    site={site} 
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(site.id)}
                    onShare={() => shareSite(site)}
                    onClick={() => navigate(`/di-tich/${site.id}/${slugify(site.name)}`)}
                    periodName={periods?.find(p => p.id === site.periodId)?.name || ''}
                    periodSlug={periods?.find(p => p.id === site.periodId)?.slug}
                    onPeriodClick={(slug) => navigate(`/thoi-ky/${slug}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Card component for a historical site
interface SiteCardProps {
  site: HistoricalSite;
  isFavorite: boolean;
  periodName: string;
  periodSlug?: string;
  onToggleFavorite: () => void;
  onShare: () => void;
  onClick: () => void;
  onPeriodClick?: (slug: string) => void;
}

function SiteCard({ site, isFavorite, periodName, periodSlug, onToggleFavorite, onShare, onClick, onPeriodClick }: SiteCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="h-56 overflow-hidden relative cursor-pointer" onClick={onClick}>
        <img 
          src={site.imageUrl || ERROR_IMAGE}
          alt={site.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = ERROR_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
        
        {/* Location tag */}
        <div className="absolute top-0 left-0 mt-3 ml-3">
          <Badge className="bg-red-600 text-white px-3 py-1 text-xs font-medium rounded-full shadow-md">
            <MapPin size={12} className="mr-1" />
            {site.location}
          </Badge>
        </div>
        
        {/* Period tag - Now clickable */}
        {periodName && periodSlug && (
          <div className="absolute bottom-0 left-0 mb-3 ml-3">
            <Badge 
              className="bg-black/60 text-white px-3 py-1 text-xs font-medium rounded-full shadow-md cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onPeriodClick && periodSlug) {
                  onPeriodClick(periodSlug);
                }
              }}
            >
              {periodName}
            </Badge>
          </div>
        )}
        
        {/* Year built tag */}
        {site.yearBuilt && (
          <div className="absolute top-0 right-0 mt-3 mr-3">
            <Badge className="bg-white/80 text-gray-800 px-2 py-1 text-xs font-medium rounded-full shadow-sm">
              <Calendar size={12} className="mr-1" />
              {site.yearBuilt}
            </Badge>
          </div>
        )}

        {/* Favorite badge */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute right-3 bottom-3 h-9 w-9 rounded-full ${isFavorite ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/80 text-gray-800 hover:bg-white'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div onClick={onClick} style={{ cursor: 'pointer' }}>
          <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary">{site.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{site.description}</p>
        </div>
        
        <div className="mt-auto pt-3 border-t flex justify-between items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded text-xs text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-700 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (site.mapUrl) window.open(site.mapUrl, '_blank');
            }}
            disabled={!site.mapUrl}
          >
            <MapPin size={14} className="mr-1" />
            Bản đồ
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            className="rounded text-xs bg-[#C62828] hover:bg-[#B71C1C] text-white flex-1"
            onClick={onClick}
          >
            <Info size={14} className="mr-1" />
            Chi tiết
          </Button>
        </div>
      </div>
    </Card>
  );
}

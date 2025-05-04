import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SearchResult, PeriodData, EventType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Clock, BookOpen, User, MapPin, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { slugify } from '@/lib/utils';

export default function SearchResults() {
  const [, navigate] = useLocation();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const term = searchParams.get('q') || '';
    const period = searchParams.get('period') || 'all';
    const eventType = searchParams.get('eventType') || 'all';
    
    setSearchTerm(term);
    setPeriodFilter(period);
    setEventTypeFilter(eventType);
    
    if (term) {
      performSearch(term, period, eventType);
    }
  }, [location]);
  
  // Debounce cho tìm kiếm tự động
  useEffect(() => {
    // Không tìm kiếm khi lần đầu tiên load trang (để tránh tìm kiếm lại khi mới vào trang)
    if (!searchTerm) return;
    
    const delayDebounceFn = setTimeout(() => {
      // Cập nhật URL với các tham số hiện tại
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (periodFilter !== 'all') params.set('period', periodFilter);
      if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter);
      
      navigate(`/tim-kiem?${params.toString()}`);
      performSearch(searchTerm, periodFilter, eventTypeFilter);
    }, 300); // Debounce 300ms
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, periodFilter, eventTypeFilter]);
  
  // Fetch periods and event types for filters
  const { data: periods } = useQuery<PeriodData[]>({
    queryKey: [API_ENDPOINTS.PERIODS],
  });
  
  const { data: eventTypes } = useQuery<EventType[]>({
    queryKey: [API_ENDPOINTS.EVENT_TYPES],
  });
  
  // Function to handle search
  const performSearch = async (term: string, period: string = 'all', eventType: string = 'all') => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // In a real implementation, this would be an API call with filters
      // For now, we'll simulate search by fetching all data and filtering client-side
      
      // Fetch events
      const eventsRes = await fetch(API_ENDPOINTS.EVENTS);
      const events = await eventsRes.json();
      
      // Fetch figures
      const figuresRes = await fetch(API_ENDPOINTS.HISTORICAL_FIGURES);
      const figures = await figuresRes.json();
      
      // Fetch sites
      const sitesRes = await fetch(API_ENDPOINTS.HISTORICAL_SITES);
      const sites = await sitesRes.json();
      
      // Combine and convert to search results
      let results: SearchResult[] = [];
      
      // Convert events to search results
      const eventResults = events
        .filter((event: any) => {
          const matchesTerm = 
            event.title.toLowerCase().includes(term.toLowerCase()) ||
            event.description.toLowerCase().includes(term.toLowerCase());
          
          const matchesPeriod = period === 'all' || String(event.periodId) === period;
          
          // Note: In a real implementation, we would check eventTypes relation
          // For now, we'll assume event type filter only applies to events
          
          return matchesTerm && matchesPeriod;
        })
        .map((event: any) => ({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          subtitle: event.year || 'Năm không xác định',
          link: `/su-kien/${event.id}/${slugify(event.title)}`,
          icon: 'clock'
        }));
      
      // Convert figures to search results
      const figureResults = figures
        .filter((figure: any) => {
          const matchesTerm = 
            figure.name.toLowerCase().includes(term.toLowerCase()) ||
            figure.description.toLowerCase().includes(term.toLowerCase());
          
          const matchesPeriod = period === 'all' || figure.period.toLowerCase().includes(
            periods?.find(p => String(p.id) === period)?.name.toLowerCase() || ''
          );
          
          return matchesTerm && matchesPeriod;
        })
        .map((figure: any) => ({
          id: `figure-${figure.id}`,
          type: 'figure',
          title: figure.name,
          subtitle: figure.lifespan || figure.period,
          link: `/nhan-vat/${figure.id}/${slugify(figure.name)}`,
          icon: 'user'
        }));
      
      // Convert sites to search results
      const siteResults = sites
        .filter((site: any) => {
          const matchesTerm = 
            site.name.toLowerCase().includes(term.toLowerCase()) ||
            site.description.toLowerCase().includes(term.toLowerCase());
          
          const matchesPeriod = period === 'all' || String(site.periodId) === period;
          
          return matchesTerm && matchesPeriod;
        })
        .map((site: any) => ({
          id: `site-${site.id}`,
          type: 'site',
          title: site.name,
          subtitle: site.location,
          link: `/di-tich/${site.id}/${slugify(site.name)}`,
          icon: 'mapPin'
        }));
      
      // Combine all results
      results = [...eventResults, ...figureResults, ...siteResults];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Xóa useEffect thừa vì đã có debounce ở trên
  
  // Handle form submission (keeping this for the Enter key functionality)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (periodFilter !== 'all') params.set('period', periodFilter);
    if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter);
    
    navigate(`/tim-kiem?${params.toString()}`);
    performSearch(searchTerm, periodFilter, eventTypeFilter);
  };
  
  // Render icon based on result type
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'clock':
        return <Clock className="h-5 w-5 text-[#C62828]" />;
      case 'user':
        return <User className="h-5 w-5 text-[#4527A0]" />;
      case 'mapPin':
        return <MapPin className="h-5 w-5 text-[#00796B]" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Render badge based on result type
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'event':
        return <Badge className="bg-[#C62828]">Sự kiện</Badge>;
      case 'figure':
        return <Badge className="bg-[#4527A0]">Nhân vật</Badge>;
      case 'site':
        return <Badge className="bg-[#00796B]">Di tích</Badge>;
      case 'period':
        return <Badge className="bg-[#4CAF50]">Thời kỳ</Badge>;
      default:
        return <Badge>Khác</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Back to home button */}
      <div className="container mx-auto px-4 pt-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600 hover:text-[#ffffff] mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Trở về trang chủ
        </Button>
      </div>
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#4527A0] to-[#7E57C2] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">Tìm Kiếm</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-4 items-start">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <Input 
                placeholder="Nhập từ khóa tìm kiếm..."
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
            
            <div className="flex gap-2 items-center">
              <Filter className="h-5 w-5" />
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[180px] border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại sự kiện</SelectItem>
                  {eventTypes?.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="bg-white text-[#4527A0] hover:bg-gray-100"
            >
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </form>
        </div>
      </div>
      
      {/* Results section */}
      <div className="container mx-auto px-4 py-8">
        {isSearching ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-[#4527A0] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tìm kiếm...</p>
          </div>
        ) : searchTerm && searchResults.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-2">Không tìm thấy kết quả nào cho "{searchTerm}"</p>
            <p className="text-sm text-gray-400">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
          </div>
        ) : searchTerm ? (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Kết quả tìm kiếm cho "{searchTerm}" 
              <span className="text-gray-500 text-lg font-normal ml-2">({searchResults.length} kết quả)</span>
            </h2>
            
            <div className="space-y-4">
              {searchResults.map(result => (
                <Link key={result.id} href={result.link}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {renderIcon(result.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg text-gray-900">{result.title}</h3>
                          {renderTypeBadge(result.type)}
                        </div>
                        <p className="text-gray-600 mt-1 flex items-center">
                          {result.type === 'event' && <Calendar className="mr-1 h-4 w-4" />}
                          {result.type === 'figure' && <User className="mr-1 h-4 w-4" />}
                          {result.type === 'site' && <MapPin className="mr-1 h-4 w-4" />}
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Nhập từ khóa vào ô tìm kiếm để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}

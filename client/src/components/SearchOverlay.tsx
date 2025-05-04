import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PeriodData, EventData, HistoricalFigure, SearchResult, EventType } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: periods } = useQuery<PeriodData[]>({
    queryKey: ['/api/periods'],
  });
  
  const { data: events } = useQuery<EventData[]>({
    queryKey: ['/api/events'],
  });
  
  const { data: figures } = useQuery<HistoricalFigure[]>({
    queryKey: ['/api/historical-figures'],
  });
  
  const { data: eventTypes } = useQuery<EventType[]>({
    queryKey: ['/api/event-types'],
  });
  
  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Close overlay on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Handle search with API
  const { data: searchResults, error: searchError } = useQuery<{
    events: EventData[],
    figures: HistoricalFigure[],
    periods: PeriodData[],
    eventTypes: EventType[]
  }>({
    queryKey: ['/api/search', searchTerm, selectedPeriod, selectedEventType],
    enabled: !!(searchTerm || selectedPeriod || selectedEventType),
  });
  
  // Thực hiện tìm kiếm khi người dùng nhập
  useEffect(() => {
    // Tạo một bộ đếm thời gian để trì hoãn tìm kiếm
    const delayTimer = setTimeout(() => {
      if (!searchTerm && !selectedPeriod && !selectedEventType) {
        setResults([]);
        return;
      }
      
      // Nếu chưa có searchResults, tạm thời bỏ qua
      if (!periods || !events || !figures) return;
      
      // Tạo kết quả tìm kiếm dựa trên dữ liệu hiện có
      const newResults: SearchResult[] = [];
      
      // Lọc sự kiện
      if (events) {
        events
          .filter(event => {
            const matchesTerm = !searchTerm || 
              event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesPeriod = !selectedPeriod || 
              periods.find(p => p.id === event.periodId)?.slug === selectedPeriod;
            
            return matchesTerm && matchesPeriod;
          })
          .slice(0, 5)
          .forEach(event => {
            newResults.push({
              id: `event-${event.id}`,
              type: 'event',
              title: event.title,
              subtitle: periods?.find(p => p.id === event.periodId)?.name || '',
              link: `/su-kien/${event.id}/${slugify(event.title)}`,
              icon: 'event'
            });
          });
      }
      
      // Lọc nhân vật lịch sử
      if (figures) {
        figures
          .filter(figure => {
            const matchesTerm = !searchTerm || 
              figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (figure.description && figure.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesPeriod = !selectedPeriod || 
              periods?.find(p => p.id === figure.periodId)?.slug === selectedPeriod;
            
            return matchesTerm && matchesPeriod;
          })
          .slice(0, 5)
          .forEach(figure => {
            newResults.push({
              id: `figure-${figure.id}`,
              type: 'figure',
              title: figure.name,
              subtitle: figure.lifespan || periods?.find(p => p.id === figure.periodId)?.name || '',
              link: `/nhan-vat/${figure.id}/${slugify(figure.name)}`,
              icon: 'user'
            });
          });
      }
      
      // Lọc thời kỳ
      if (periods) {
        periods
          .filter(period => {
            return !searchTerm || 
              period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (period.description && period.description.toLowerCase().includes(searchTerm.toLowerCase()));
          })
          .slice(0, 3)
          .forEach(period => {
            newResults.push({
              id: `period-${period.id}`,
              type: 'period',
              title: period.name,
              subtitle: period.timeframe,
              link: `/thoi-ky/${period.slug}`,
              icon: 'clock'
            });
          });
      }
      
      setResults(newResults);
    }, 300); // 300ms là thời gian trì hoãn phù hợp
    
    return () => clearTimeout(delayTimer);
  }, [searchTerm, selectedPeriod, selectedEventType, periods, events, figures]);
  
  // Process API search results
  useEffect(() => {
    if (!searchResults) return;
    
    const results: SearchResult[] = [];
    
    // Process events
    if (searchResults.events) {
      searchResults.events.forEach(event => {
        results.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          subtitle: periods?.find(p => p.id === event.periodId)?.name || '',
          link: `/su-kien/${event.id}/${slugify(event.title)}`,
          icon: 'event'
        });
      });
    }
    
    // Process historical figures
    if (searchResults.figures) {
      searchResults.figures.forEach(figure => {
        results.push({
          id: `figure-${figure.id}`,
          type: 'figure',
          title: figure.name,
          subtitle: periods?.find(p => p.id === figure.periodId)?.name || "",
          link: `/nhan-vat/${figure.id}/${slugify(figure.name)}`,
          icon: 'person'
        });
      });
    }
    
    setResults(results);
  }, [searchResults, searchTerm, selectedPeriod, selectedEventType, periods]);
  
  if (!isOpen) return null;
  
  const handlePopularSearchClick = (search: {title: string, icon: string, link: string}) => {
    // Chuyển đến trang chi tiết tương ứng
    navigate(search.link);
    onClose();
  };
  
  const popularSearches = [
    { title: 'Vua Lê Lợi', icon: 'person', link: '/nhan-vat/3/le-loi' },
    { title: 'Chiến thắng Bạch Đằng', icon: 'event', link: '/su-kien/15/chien-thang-bach-dang' },
    { title: 'Hai Bà Trưng', icon: 'person', link: '/nhan-vat/5/hai-ba-trung' },
    { title: 'Tuyên Ngôn Độc Lập', icon: 'event', link: '/su-kien/31/tuyen-ngon-doc-lap' }
  ];
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      ref={overlayRef}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[hsl(var(--primary))]">
            Tìm Kiếm
          </h3>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-300"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân vật, sự kiện lịch sử..." 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-12 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={inputRef}
            />
            <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
            Lọc theo thời kỳ:
          </h4>
          <div className="flex flex-wrap gap-2">
            <span 
              className={`px-3 py-1 ${selectedPeriod === '' ? 'bg-black text-white' : 'bg-[hsl(var(--primary))] text-white'} rounded-full text-sm cursor-pointer hover:bg-black hover:text-white transition-colors`}
              onClick={() => setSelectedPeriod('')}
            >
              Tất cả
            </span>
            
            {periods?.map(period => (
              <span 
                key={period.id}
                className={`px-3 py-1 ${selectedPeriod === period.slug ? 'bg-black text-white' : 'bg-[hsl(var(--primary))] text-white'} rounded-full text-sm cursor-pointer hover:bg-black hover:text-white transition-colors`}
                onClick={() => setSelectedPeriod(period.slug)}
              >
                {period.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
            Lọc theo loại sự kiện:
          </h4>
          <div className="flex flex-wrap gap-2">
            <span 
              className={`px-3 py-1 ${selectedEventType === '' ? 'bg-black text-white' : 'bg-red-600 text-white'} rounded-full text-sm cursor-pointer hover:bg-black hover:text-white transition-colors`}
              onClick={() => setSelectedEventType('')}
            >
              Tất cả
            </span>
            
            {eventTypes?.map(type => (
              <span 
                key={type.id}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-black hover:text-white transition-colors`}
                style={{
                  backgroundColor: selectedEventType === type.slug ? '#000' : type.color || '#ff5722',
                  color: 'white'
                }}
                onClick={() => setSelectedEventType(type.slug)}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>
        
        {results.length > 0 ? (
          <div>
            <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
              Kết quả tìm kiếm:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map(result => (
                <div
                  key={result.id} 
                  onClick={() => {
                    navigate(result.link);
                    onClose();
                  }}
                  className="flex items-center p-3 bg-[hsl(var(--background))] rounded-md hover:bg-[hsl(var(--primary))] hover:text-white transition-all duration-300 cursor-pointer group"
                >
                  <span className="material-icons mr-3 text-[hsl(var(--primary))] group-hover:text-white transition-colors duration-300">
                    {result.icon}
                  </span>
                  <div>
                    <div>{result.title}</div>
                    <div className="text-sm text-gray-500 group-hover:text-white transition-colors duration-300">{result.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchTerm) params.set('q', searchTerm);
                  // Chuyển đổi slug thành id khi tìm kiếm
                  if (selectedPeriod && periods) {
                    const selectedPeriodObj = periods.find(p => p.slug === selectedPeriod);
                    if (selectedPeriodObj) {
                      params.set('period', selectedPeriodObj.id.toString());
                    }
                  }
                  // Chuyển đổi slug thành id với loại sự kiện
                  if (selectedEventType && eventTypes) {
                    const selectedEventTypeObj = eventTypes.find(t => t.slug === selectedEventType);
                    if (selectedEventTypeObj) {
                      params.set('eventType', selectedEventTypeObj.id.toString());
                    }
                  }
                  
                  navigate(`/tim-kiem?${params.toString()}`);
                  onClose();
                }}
                className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))] hover:opacity-90"
              >
                <span className="material-icons mr-2 text-sm">search</span>
                Xem tất cả kết quả tìm kiếm
              </Button>
            </div>
          </div>
        ) : searchTerm || selectedPeriod || selectedEventType ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">Không tìm thấy kết quả phù hợp</div>
            <Button
              onClick={() => {
                const params = new URLSearchParams();
                if (searchTerm) params.set('q', searchTerm);
                // Chuyển đổi slug thành id khi tìm kiếm
                if (selectedPeriod && periods) {
                  const selectedPeriodObj = periods.find(p => p.slug === selectedPeriod);
                  if (selectedPeriodObj) {
                    params.set('period', selectedPeriodObj.id.toString());
                  }
                }
                // Chuyển đổi slug thành id với loại sự kiện
                if (selectedEventType && eventTypes) {
                  const selectedEventTypeObj = eventTypes.find(t => t.slug === selectedEventType);
                  if (selectedEventTypeObj) {
                    params.set('eventType', selectedEventTypeObj.id.toString());
                  }
                }
                
                navigate(`/tim-kiem?${params.toString()}`);
                onClose();
              }}
              variant="outline"
              className="mx-auto"
            >
              <span className="material-icons mr-2 text-sm">search</span>
              Tìm kiếm nâng cao
            </Button>
          </div>
        ) : (
          <div>
            <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
              Tìm kiếm phổ biến:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularSearches.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handlePopularSearchClick(item)}
                  className="flex items-center p-3 bg-[hsl(var(--background))] rounded-md hover:bg-[hsl(var(--primary))] hover:text-white transition-all duration-300 cursor-pointer group"
                >
                  <span className="material-icons mr-3 text-[hsl(var(--primary))] group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

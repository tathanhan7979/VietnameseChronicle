import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PeriodData, EventData, HistoricalFigure, SearchResult } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
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
  
  // Handle search
  useEffect(() => {
    if (!searchTerm && !selectedPeriod) {
      setResults([]);
      return;
    }
    
    const searchResults: SearchResult[] = [];
    
    // Search in events
    if (events) {
      events.forEach(event => {
        const matchesTerm = searchTerm && (
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const matchesPeriod = !selectedPeriod || 
          (periods?.find(p => p.id === event.periodId)?.slug === selectedPeriod);
        
        if ((matchesTerm || !searchTerm) && matchesPeriod) {
          searchResults.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            subtitle: periods?.find(p => p.id === event.periodId)?.name || '',
            link: `#period-${periods?.find(p => p.id === event.periodId)?.slug || ''}`,
            icon: 'event'
          });
        }
      });
    }
    
    // Search in historical figures
    if (figures) {
      figures.forEach(figure => {
        const matchesTerm = searchTerm && (
          figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          figure.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const matchesPeriod = !selectedPeriod || figure.period.toLowerCase().includes(selectedPeriod.toLowerCase());
        
        if ((matchesTerm || !searchTerm) && matchesPeriod) {
          searchResults.push({
            id: `figure-${figure.id}`,
            type: 'figure',
            title: figure.name,
            subtitle: figure.period,
            link: `/nhan-vat/${figure.id}/${slugify(figure.name)}`,
            icon: 'person'
          });
        }
      });
    }
    
    setResults(searchResults);
  }, [searchTerm, selectedPeriod, events, figures, periods]);
  
  if (!isOpen) return null;
  
  const popularSearches = [
    { title: 'Vua Lê Lợi', icon: 'person', link: '#figures' },
    { title: 'Chiến thắng Bạch Đằng', icon: 'event', link: '#period-tran' },
    { title: 'Hai Bà Trưng', icon: 'person', link: '#figures' },
    { title: 'Cách mạng tháng Tám', icon: 'event', link: '#period-modern' }
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
        
        <div className="mb-6">
          <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
            Lọc theo thời kỳ:
          </h4>
          <div className="flex flex-wrap gap-2">
            <span 
              className={`px-3 py-1 ${selectedPeriod === '' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))]'} rounded-full text-sm cursor-pointer hover:bg-opacity-20`}
              onClick={() => setSelectedPeriod('')}
            >
              Tất cả
            </span>
            
            {periods?.map(period => (
              <span 
                key={period.id}
                className={`px-3 py-1 ${selectedPeriod === period.slug ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))]'} rounded-full text-sm cursor-pointer hover:bg-opacity-20`}
                onClick={() => setSelectedPeriod(period.slug)}
              >
                {period.name}
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
                <a 
                  key={result.id} 
                  href={result.link}
                  onClick={() => {
                    onClose();
                  }}
                  className="flex items-center p-3 bg-[hsl(var(--background))] rounded-md hover:bg-[hsl(var(--primary))] hover:bg-opacity-10 transition-colors duration-300"
                >
                  <span className="material-icons mr-3 text-[hsl(var(--primary))]">
                    {result.icon}
                  </span>
                  <div>
                    <div>{result.title}</div>
                    <div className="text-sm text-gray-500">{result.subtitle}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : searchTerm || selectedPeriod ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy kết quả phù hợp
          </div>
        ) : (
          <div>
            <h4 className="font-['Montserrat'] font-bold mb-3 text-[hsl(var(--foreground))]">
              Tìm kiếm phổ biến:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularSearches.map((item, index) => (
                <a 
                  key={index} 
                  href={item.link}
                  onClick={onClose}
                  className="flex items-center p-3 bg-[hsl(var(--background))] rounded-md hover:bg-[hsl(var(--primary))] hover:bg-opacity-10 transition-colors duration-300"
                >
                  <span className="material-icons mr-3 text-[hsl(var(--primary))]">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

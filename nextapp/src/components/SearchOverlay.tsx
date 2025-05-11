import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: 'event' | 'figure' | 'site' | 'period';
  url: string;
  imageUrl?: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  if (!isOpen) return null;
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Sự kiện';
      case 'figure': return 'Nhân vật';
      case 'site': return 'Di tích';
      case 'period': return 'Thời kỳ';
      default: return 'Khác';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-red-500';
      case 'figure': return 'bg-blue-500';
      case 'site': return 'bg-green-500';
      case 'period': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start justify-center pt-20">
      <div 
        ref={overlayRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm sự kiện, nhân vật, di tích lịch sử..."
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            </div>
          ) : searchTerm.length > 0 ? (
            results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <Link 
                    href={result.url} 
                    key={`${result.type}-${result.id}`}
                    className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    onClick={onClose}
                  >
                    <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 mr-3">
                      {result.imageUrl ? (
                        <Image
                          src={result.imageUrl}
                          alt={result.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{result.title}</h4>
                        <span className={`text-xs text-white px-2 py-1 rounded-full ${getTypeBadgeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                </svg>
                <p>Không tìm thấy kết quả phù hợp với từ khóa "{searchTerm}"</p>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Nhập từ khóa để tìm kiếm thông tin về lịch sử Việt Nam</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          Nhấn ESC để đóng
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API_ENDPOINTS } from '../lib/constants';
import { SearchResult } from '../lib/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input và reset state khi overlay mở
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setResults([]);
      setSelectedResultIndex(-1);
      setIsLoading(false);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Đóng overlay khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [onClose]);

  // Tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.SEARCH}?term=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Xử lý phím mũi tên và Enter cho kết quả tìm kiếm
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
        navigateToResult(results[selectedResultIndex]);
      } else {
        // Nếu không có kết quả nào được chọn, chuyển đến trang tìm kiếm với từ khóa hiện tại
        router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm)}`);
        onClose();
      }
    }
  };

  // Chuyển đến kết quả tìm kiếm
  const navigateToResult = (result: SearchResult) => {
    router.push(result.link);
    onClose();
  };

  // Icon dựa trên loại kết quả
  const renderIcon = (type: string) => {
    switch (type) {
      case 'period':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'figure':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'site':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search container */}
      <div className="relative min-h-screen flex items-start justify-center pt-16 pb-8 px-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full py-3 pl-10 pr-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tìm kiếm..."
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
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
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Đang tìm kiếm...</p>
              </div>
            )}

            {!isLoading && results.length === 0 && searchTerm.trim().length >= 2 && (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy kết quả nào cho "{searchTerm}"</p>
              </div>
            )}

            {!isLoading && searchTerm.trim().length < 2 && (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Nhập ít nhất 2 ký tự để tìm kiếm</p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <Link 
                      href={result.link}
                      className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        index === selectedResultIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={onClose}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {renderIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer with shortcut hints */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="inline-flex items-center mr-3">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">↑</kbd>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded ml-1">↓</kbd>
                <span className="ml-1">để chọn</span>
              </span>
              <span className="inline-flex items-center">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Enter</kbd>
                <span className="ml-1">để mở</span>
              </span>
            </div>
            <div>
              <span className="inline-flex items-center">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd>
                <span className="ml-1">để đóng</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
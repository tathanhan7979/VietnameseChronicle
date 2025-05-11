import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';

// Types
interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: 'event' | 'figure' | 'site' | 'period';
  url: string;
  imageUrl?: string;
}

// Helper function to create slugs
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function SearchPage() {
  const router = useRouter();
  const { q: queryParam } = router.query;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Update search term when URL query param changes
  useEffect(() => {
    if (typeof queryParam === 'string') {
      setSearchTerm(queryParam);
    }
  }, [queryParam]);

  // Fetch results when search term changes
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/tim-kiem',
      query: { q: searchTerm }
    });
  };

  // Filter results by type
  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(result => result.type === activeFilter);

  // Get counts for each result type
  const counts = {
    all: results.length,
    event: results.filter(r => r.type === 'event').length,
    figure: results.filter(r => r.type === 'figure').length,
    site: results.filter(r => r.type === 'site').length,
    period: results.filter(r => r.type === 'period').length,
  };

  // Helper function to get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Sự kiện';
      case 'figure': return 'Nhân vật';
      case 'site': return 'Di tích';
      case 'period': return 'Thời kỳ';
      default: return 'Khác';
    }
  };

  // Helper function to get type badge color
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
    <Layout
      title={`Tìm kiếm: ${searchTerm || 'Khám phá lịch sử Việt Nam'} | Lịch Sử Việt Nam`}
      description={`Kết quả tìm kiếm cho "${searchTerm}" - Khám phá thông tin về các sự kiện, nhân vật, di tích và thời kỳ lịch sử Việt Nam.`}
      url="https://lichsuviet.edu.vn/tim-kiem"
      noIndex={true} // Don't index search pages
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-block px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
            >
              ← Trở về trang chủ
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-6">Tìm kiếm</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="w-full rounded-lg border border-gray-300 py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {searchTerm && (
              <>
                {/* Filters */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === 'all'
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      Tất cả ({counts.all})
                    </button>
                    <button
                      onClick={() => setActiveFilter('event')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === 'event'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Sự kiện ({counts.event})
                    </button>
                    <button
                      onClick={() => setActiveFilter('figure')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === 'figure'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      Nhân vật ({counts.figure})
                    </button>
                    <button
                      onClick={() => setActiveFilter('site')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === 'site'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Di tích ({counts.site})
                    </button>
                    <button
                      onClick={() => setActiveFilter('period')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === 'period'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      Thời kỳ ({counts.period})
                    </button>
                  </div>
                </div>

                {/* Results */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-6">
                    {filteredResults.map((result) => (
                      <Link
                        href={result.url}
                        key={`${result.type}-${result.id}`}
                        className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                      >
                        <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100 mr-4">
                          {result.imageUrl ? (
                            <Image
                              src={result.imageUrl}
                              alt={result.title}
                              width={80}
                              height={80}
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
                            <h3 className="font-semibold text-lg text-gray-900">{result.title}</h3>
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
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                    </svg>
                    <p className="text-gray-500 text-lg">Không tìm thấy kết quả nào phù hợp với từ khóa "{searchTerm}"</p>
                    <p className="text-gray-400 mt-2">Hãy thử với từ khóa khác hoặc ít từ hơn</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
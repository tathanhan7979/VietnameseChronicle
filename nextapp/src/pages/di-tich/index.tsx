import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';

// Types
interface HistoricalSite {
  id: number;
  name: string;
  periodId: number;
  location: string;
  description: string;
  imageUrl?: string;
  mapUrl?: string;
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
}

interface HistoricalSitesPageProps {
  sites: HistoricalSite[];
  periods: Period[];
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

import { API_ENDPOINTS } from '../../lib/constants';

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch all historical sites
    const sitesRes = await fetch(API_ENDPOINTS.HISTORICAL_SITES);
    const sites = await sitesRes.json();

    // Fetch all periods for filtering
    const periodsRes = await fetch(API_ENDPOINTS.PERIODS);
    const periods = await periodsRes.json();

    return {
      props: {
        sites,
        periods,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        sites: [],
        periods: [],
      },
      revalidate: 60,
    };
  }
};

export default function HistoricalSitesPage({ sites, periods }: HistoricalSitesPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sites based on selected period and search term
  const filteredSites = sites.filter((site) => {
    const matchesPeriod = selectedPeriod ? site.periodId === selectedPeriod : true;
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         site.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPeriod && matchesSearch;
  });

  return (
    <Layout
      title="Di Tích Lịch Sử | Lịch Sử Việt Nam"
      description="Khám phá các di tích lịch sử của Việt Nam qua các thời kỳ, từ cố đô, đền, chùa đến các địa điểm lịch sử quan trọng."
      url="https://lichsuviet.edu.vn/di-tich"
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
              Di Tích Lịch Sử Việt Nam
            </h1>
            <p className="text-gray-600 mb-8 max-w-3xl">
              Khám phá các di tích lịch sử - văn hóa tiêu biểu của Việt Nam qua các thời kỳ, từ cố đô, đền, chùa đến các địa điểm đã chứng kiến những sự kiện lịch sử quan trọng.
            </p>

            {/* Filter and search controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-lg shadow-sm">
              <div className="flex-1">
                <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Lọc theo thời kỳ
                </label>
                <select
                  id="period-filter"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={selectedPeriod || ''}
                  onChange={(e) => setSelectedPeriod(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Tất cả các thời kỳ</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name} ({period.timeframe})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm theo tên hoặc địa điểm
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Nhập tên di tích hoặc địa điểm..."
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sites grid */}
          {filteredSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSites.map((site) => {
                const period = periods.find((p) => p.id === site.periodId);
                
                return (
                  <Link
                    key={site.id}
                    href={`/di-tich/${site.id}/${slugify(site.name)}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all group-hover:shadow-lg h-full">
                      <div className="h-56 relative overflow-hidden">
                        {site.imageUrl ? (
                          <Image
                            src={site.imageUrl}
                            alt={site.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="material-icons text-4xl text-gray-400">
                              place
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white/90 text-sm flex items-center">
                            <span className="material-icons text-sm mr-1">
                              place
                            </span>
                            {site.location}
                          </p>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-red-600 group-hover:text-red-700">
                          {site.name}
                        </h3>
                        {period && (
                          <p className="text-gray-600 text-sm mb-3">
                            Thời kỳ: {period.name}
                          </p>
                        )}
                        <p className="text-gray-700 line-clamp-3">
                          {site.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <span className="material-icons text-5xl text-gray-400 mb-4">
                search_off
              </span>
              <p className="text-gray-500">
                {searchTerm
                  ? `Không tìm thấy di tích phù hợp với "${searchTerm}"`
                  : 'Không có di tích lịch sử trong thời kỳ này'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';

interface HistoricalFigure {
  id: number;
  name: string;
  periodId: number;
  description: string;
  lifespan: string;
  imageUrl: string;
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
}

interface HistoricalFiguresPageProps {
  figures: HistoricalFigure[];
  periods: Period[];
}

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
    // Fetch all historical figures
    const figuresRes = await fetch(API_ENDPOINTS.HISTORICAL_FIGURES);
    const figures = await figuresRes.json();

    // Fetch all periods for filtering
    const periodsRes = await fetch(API_ENDPOINTS.PERIODS);
    const periods = await periodsRes.json();

    return {
      props: {
        figures,
        periods,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        figures: [],
        periods: [],
      },
      revalidate: 60,
    };
  }
};

export default function HistoricalFiguresPage({ figures, periods }: HistoricalFiguresPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter figures based on selected period and search term
  const filteredFigures = figures.filter((figure) => {
    const matchesPeriod = selectedPeriod ? figure.periodId === selectedPeriod : true;
    const matchesSearch = figure.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPeriod && matchesSearch;
  });

  return (
    <Layout
      title="Nhân Vật Lịch Sử | Lịch Sử Việt Nam"
      description="Khám phá các nhân vật lịch sử tiêu biểu của Việt Nam qua các thời kỳ với đầy đủ thông tin về cuộc đời và những đóng góp của họ."
      url="https://lichsuviet.edu.vn/nhan-vat"
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
              Nhân Vật Lịch Sử Việt Nam
            </h1>
            <p className="text-gray-600 mb-8 max-w-3xl">
              Khám phá cuộc đời và sự nghiệp của các nhân vật lịch sử tiêu biểu đã có những đóng góp quan trọng vào lịch sử dân tộc Việt Nam qua các thời kỳ.
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
                  Tìm kiếm nhân vật
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Nhập tên nhân vật..."
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Figures grid */}
          {filteredFigures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredFigures.map((figure) => {
                const period = periods.find((p) => p.id === figure.periodId);
                
                return (
                  <Link
                    key={figure.id}
                    href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all group-hover:shadow-lg h-full">
                      <div className="h-64 relative overflow-hidden">
                        {figure.imageUrl ? (
                          <Image
                            src={figure.imageUrl}
                            alt={figure.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="material-icons text-4xl text-gray-400">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-red-600 group-hover:text-red-700">
                          {figure.name}
                        </h3>
                        {figure.lifespan && (
                          <p className="text-gray-600 text-sm mb-2">
                            {figure.lifespan}
                          </p>
                        )}
                        {period && (
                          <p className="text-gray-600 text-sm mb-3">
                            Thời kỳ: {period.name}
                          </p>
                        )}
                        <p className="text-gray-700 line-clamp-3">
                          {figure.description}
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
                  ? `Không tìm thấy nhân vật phù hợp với "${searchTerm}"`
                  : 'Không có nhân vật lịch sử trong thời kỳ này'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
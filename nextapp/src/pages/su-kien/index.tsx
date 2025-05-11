import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';

// Types
interface EventData {
  id: number;
  periodId: number;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
  eventTypes?: { id: number; name: string; color: string }[];
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
}

interface EventType {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface EventsPageProps {
  events: EventData[];
  periods: Period[];
  eventTypes: EventType[];
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
    // Fetch all events
    const eventsRes = await fetch(API_ENDPOINTS.EVENTS);
    const events = await eventsRes.json();

    // Fetch all periods
    const periodsRes = await fetch(API_ENDPOINTS.PERIODS);
    const periods = await periodsRes.json();

    // Fetch all event types
    const eventTypesRes = await fetch(API_ENDPOINTS.EVENT_TYPES);
    const eventTypes = await eventTypesRes.json();

    return {
      props: {
        events,
        periods,
        eventTypes,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        events: [],
        periods: [],
        eventTypes: [],
      },
      revalidate: 60,
    };
  }
};

export default function EventsPage({ events, periods, eventTypes }: EventsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter events based on selections
  const filteredEvents = events.filter((event) => {
    const matchesPeriod = selectedPeriod ? event.periodId === selectedPeriod : true;
    const matchesEventType = selectedEventType
      ? event.eventTypes?.some((type) => type.id === selectedEventType)
      : true;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPeriod && matchesEventType && matchesSearch;
  });

  return (
    <Layout
      title="Sự Kiện Lịch Sử | Lịch Sử Việt Nam"
      description="Khám phá các sự kiện lịch sử quan trọng của Việt Nam từ thời tiền sử đến hiện đại."
      url="https://lichsuviet.edu.vn/su-kien"
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
              Sự Kiện Lịch Sử Việt Nam
            </h1>
            <p className="text-gray-600 mb-8 max-w-3xl">
              Khám phá các sự kiện lịch sử quan trọng đã định hình nên đất nước và con người Việt Nam qua hàng nghìn năm lịch sử.
            </p>

            {/* Filter controls */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Thời kỳ
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
                
                <div>
                  <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại sự kiện
                  </label>
                  <select
                    id="type-filter"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={selectedEventType || ''}
                    onChange={(e) => setSelectedEventType(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Tất cả các loại</option>
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Tìm kiếm sự kiện..."
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Timeline view */}
            {filteredEvents.length > 0 ? (
              <div className="flex flex-col space-y-6">
                {filteredEvents.map((event) => {
                  const period = periods.find((p) => p.id === event.periodId);
                  
                  return (
                    <Link
                      key={event.id}
                      href={`/su-kien/${event.id}/${slugify(event.title)}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all group-hover:shadow-lg">
                        <div className="md:flex">
                          {/* Event image or placeholder */}
                          <div className="md:w-1/3 h-48 md:h-auto relative">
                            {event.imageUrl ? (
                              <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="material-icons text-4xl text-gray-400">
                                  event
                                </span>
                              </div>
                            )}
                            {event.year && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <p className="text-white font-medium">
                                  {event.year}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Event content */}
                          <div className="p-6 md:w-2/3">
                            <h2 className="text-xl font-bold mb-2 text-red-600 group-hover:text-red-700">
                              {event.title}
                            </h2>
                            
                            {period && (
                              <p className="text-gray-600 text-sm mb-2">
                                Thời kỳ: {period.name}
                              </p>
                            )}
                            
                            {event.eventTypes && event.eventTypes.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {event.eventTypes.map((type) => (
                                  <span
                                    key={type.id}
                                    className="px-3 py-1 text-xs text-white rounded-full"
                                    style={{ backgroundColor: type.color }}
                                  >
                                    {type.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-gray-700 mb-4 line-clamp-3">
                              {event.description}
                            </p>
                            
                            <span className="text-red-600 font-medium inline-flex items-center group-hover:text-red-800">
                              Xem chi tiết
                              <svg
                                className="w-4 h-4 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </div>
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
                    ? `Không tìm thấy sự kiện phù hợp với "${searchTerm}"`
                    : 'Không có sự kiện nào phù hợp với bộ lọc hiện tại'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
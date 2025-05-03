import { useState, useEffect } from 'react';
import { HistoricalSite } from '../lib/types';
import { API_ENDPOINTS, DEFAULT_IMAGE } from '../lib/constants';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Info, Building, Landmark } from "lucide-react";

export default function HistoricalSitesSection() {
  const { isLoading, error, data } = useQuery<HistoricalSite[]>({
    queryKey: [API_ENDPOINTS.HISTORICAL_SITES],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.HISTORICAL_SITES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <section id="historical-sites" className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Di Tích Lịch Sử</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse overflow-hidden h-96">
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/5 mb-2"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="historical-sites" className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Di Tích Lịch Sử</h2>
          <p className="text-center text-red-500">Đã xảy ra lỗi khi tải dữ liệu</p>
        </div>
      </section>
    );
  }

  const sites = data || [];

  return (
    <section id="historical-sites" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Di Tích Lịch Sử</h2>
        <p className="text-center text-gray-600 mb-12">Những địa điểm lịch sử quan trọng của dân tộc Việt Nam</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map(site => (
            <Card key={site.id} className="overflow-hidden h-full shadow-lg transition-transform hover:scale-105">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={site.imageUrl || DEFAULT_IMAGE}
                  alt={site.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 mt-2 mr-2">
                  <Badge className="bg-red-600 text-white hover:bg-red-700">{site.location}</Badge>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{site.name}</h3>
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{site.address || site.location}</span>
                </div>
                {site.yearBuilt && (
                  <div className="flex items-center text-gray-600 mb-1">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">Năm xây dựng: {site.yearBuilt}</span>
                  </div>
                )}
                
                <p className="my-3 text-gray-700">{site.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <button 
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    onClick={() => window.open(`https://maps.google.com/?q=${site.latitude},${site.longitude}`, '_blank')}
                    disabled={!site.latitude || !site.longitude}
                  >
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">Xem bản đồ</span>
                  </button>
                  
                  <button className="flex items-center text-blue-600 hover:text-blue-800">
                    <Info size={16} className="mr-1" />
                    <span className="text-sm">Chi tiết</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

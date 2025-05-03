import { useState, useEffect } from 'react';
import { HistoricalSite } from '../lib/types';
import { API_ENDPOINTS, DEFAULT_IMAGE } from '../lib/constants';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Info, Building, Landmark } from "lucide-react";
import { slugify } from "../lib/utils";

export default function HistoricalSitesSection() {
  const [, navigate] = useLocation();
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
    <section id="historical-sites" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 relative inline-block">
            <span className="relative z-10">Di Tích Lịch Sử</span>
            <span className="absolute bottom-0 left-0 w-full h-3 bg-red-100 -z-10 transform -rotate-1"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Khám phá những địa điểm lịch sử văn hóa tiêu biểu của dân tộc Việt Nam 
            qua hàng ngàn năm lịch sử
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map(site => (
            <Card 
              key={site.id} 
              className="overflow-hidden h-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="h-60 overflow-hidden relative group">
                <img 
                  src={site.imageUrl || DEFAULT_IMAGE}
                  alt={site.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className="absolute top-0 left-0 mt-3 ml-3">
                  <Badge className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-xs font-medium rounded-full shadow-md">
                    <MapPin size={12} className="mr-1" />
                    {site.location}
                  </Badge>
                </div>
                {site.yearBuilt && (
                  <div className="absolute top-0 right-0 mt-3 mr-3">
                    <Badge className="bg-white/80 text-gray-800 px-2 py-1 text-xs font-medium rounded-full shadow-sm">
                      <Calendar size={12} className="mr-1" />
                      {site.yearBuilt}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary">{site.name}</h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{site.description}</p>
                
                <div className="pt-4 mt-auto border-t flex justify-between items-center">
                  {site.mapUrl ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => site.mapUrl ? window.open(site.mapUrl, '_blank') : null}
                      className="text-xs rounded-full"
                    >
                      <MapPin size={14} className="mr-1" />
                      Bản đồ
                    </Button>
                  ) : <div></div>}
                  
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate(`/di-tich/${site.id}/${slugify(site.name)}`)}
                    className="text-xs bg-primary hover:bg-primary/90 rounded-full"
                  >
                    <Info size={14} className="mr-1" />
                    Chi tiết
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Nút xem thêm */}
        <div className="mt-12 text-center">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full shadow-md"
            onClick={() => navigate('/di-tich')}
          >
            Xem tất cả di tích
          </Button>
        </div>
      </div>
    </section>
  );
}

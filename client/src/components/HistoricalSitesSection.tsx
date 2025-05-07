import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { HistoricalSite } from "@/lib/types";
import { DEFAULT_IMAGE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Info,
  LandmarkIcon,
  ExternalLink,
} from "lucide-react";
import { slugify } from "@/lib/utils";

interface HistoricalSitesSectionProps {
  sites?: HistoricalSite[];
}

export default function HistoricalSitesSection({
  sites: propSites,
}: HistoricalSitesSectionProps = {}) {
  const [, navigate] = useLocation();
  const { data: querySites, isLoading } = useQuery<HistoricalSite[]>({
    queryKey: ["/api/historical-sites"],
  });

  // Use provided sites or query results and randomize them
  const [randomizedSites, setRandomizedSites] = useState<HistoricalSite[]>([]);

  useEffect(() => {
    const allSites = propSites || querySites || [];
    if (allSites.length === 0) return;

    // Create a copy to avoid mutating the original data
    const shuffled = [...allSites];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setRandomizedSites(shuffled);
  }, [propSites, querySites]);

  const sites = randomizedSites;

  if (isLoading && !propSites) {
    return (
      <section id="historical-sites" className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828] mb-16">
            Đang tải dữ liệu di tích...
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (sites.length === 0) {
    return (
      <section id="historical-sites" className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828] mb-8">
            Không tìm thấy dữ liệu di tích
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section id="historical-sites" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#C62828] inline-flex items-center justify-center gap-3">
            <LandmarkIcon className="h-8 w-8" />
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate("/di-tich")}
            >
              Di Tích <span className="text-[#4527A0]">Lịch Sử Tiêu Biểu</span>
            </span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Khám phá những địa điểm lịch sử văn hóa tiêu biểu của dân tộc Việt
            Nam qua hàng ngàn năm lịch sử
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.slice(0, 6).map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="h-52 overflow-hidden relative group">
                  <picture>
                    <img
                      src={site.imageUrl || DEFAULT_IMAGE}
                      alt={site.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/error-img.png";
                      }}
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#C62828] text-white hover:bg-[#B71C1C] px-3 py-1 text-xs font-medium rounded-full shadow-md">
                      <MapPin size={12} className="mr-1" />
                      {site.location}
                    </Badge>
                  </div>

                  {site.yearBuilt && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#4527A0] text-white px-2 py-1 text-xs font-medium rounded-full shadow-sm">
                        <Calendar size={12} className="mr-1" />
                        {site.yearBuilt}
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-['Playfair_Display'] font-bold text-xl text-white group-hover:underline">
                      {site.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex flex-col" style={{ height: "200px" }}>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {site.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        site.mapUrl ? window.open(site.mapUrl, "_blank") : null
                      }
                      className="rounded text-xs text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-700 flex-1"
                      disabled={!site.mapUrl}
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Bản đồ
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        navigate(`/di-tich/${site.id}/${slugify(site.name)}`)
                      }
                      className="rounded text-xs bg-[#C62828] hover:bg-[#B71C1C] text-white flex-1"
                    >
                      <Info size={14} className="mr-1" />
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            className="rounded-md bg-[#4527A0] hover:bg-[#C62828] text-white px-8 py-3 text-lg shadow-md hover:shadow-lg transition-all"
            onClick={() => navigate("/di-tich")}
          >
            Xem tất cả di tích
            <LandmarkIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

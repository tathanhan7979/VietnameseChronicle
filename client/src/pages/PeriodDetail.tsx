import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  History,
  Home,
  MapPin,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  PeriodData,
  EventData,
  HistoricalFigure,
  HistoricalSite,
} from "@/lib/types";
import { PERIOD_ICONS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { motion } from "framer-motion";

export default function PeriodDetail() {
  const { periodSlug } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");

  // 1. Fetch the period data using slug
  const {
    data: period,
    isLoading: isLoadingPeriod,
    error: periodError,
  } = useQuery<PeriodData>({
    queryKey: [`/api/periods/slug/${periodSlug}`],
  });

  // 2. Fetch events from this period using the slug
  const { data: events, isLoading: isLoadingEvents } = useQuery<EventData[]>({
    queryKey: [`/api/events/period-slug/${periodSlug}`],
    enabled: !!periodSlug,
  });

  // 3. Fetch historical figures from this period using the period's name
  const { data: allFigures, isLoading: isLoadingFigures } = useQuery<
    HistoricalFigure[]
  >({
    queryKey: ["/api/historical-figures"],
    enabled: !!period,
  });

  // 4. Fetch historical sites from this period using the slug
  const { data: sites, isLoading: isLoadingSites } = useQuery<HistoricalSite[]>(
    {
      queryKey: [`/api/periods-slug/${periodSlug}/historical-sites`],
      enabled: !!periodSlug,
    },
  );

  // Filter historical figures based on periodId
  const figures =
    allFigures?.filter(
      (figure) => period && figure.periodId === period.id,
    ) || [];

  const isLoading =
    isLoadingPeriod || isLoadingEvents || isLoadingFigures || isLoadingSites;

  // If period not found
  if (!isLoading && !period) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">
          Không tìm thấy thời kỳ
        </h1>
        <p className="mb-8">
          Thời kỳ lịch sử bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/">
          <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:opacity-90">
            <Home className="mr-2" />
            Trở về trang chủ
          </Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!period || periodError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
        <p className="mb-6">
          Không thể tải thông tin thời kỳ. Vui lòng thử lại sau.
        </p>
        <Button onClick={() => setLocation("/")}>
          <Home className="mr-2 h-4 w-4" /> Về trang chủ
        </Button>
      </div>
    );
  }

  // Content variations for empty states
  const eventsContent =
    !events || events.length === 0 ? (
      <div className="text-center py-10">
        <div className="text-gray-500 mb-4">
          <List className="h-16 w-16 mx-auto opacity-25" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có sự kiện</h3>
        <p className="text-gray-600">
          Chưa có sự kiện nào được thêm vào thời kỳ này.
        </p>
      </div>
    ) : (
      <div className="space-y-8 py-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[hsl(var(--primary))]">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <CalendarDays className="h-4 w-4 mr-2 text-[hsl(var(--secondary))]" />
                    <span>{event.year}</span>
                  </div>
                </div>
                {event.eventTypes && event.eventTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {event.eventTypes.map((type) => (
                      <Badge
                        key={type.id}
                        style={{ backgroundColor: type.color || "#C62828" }}
                        className="text-white"
                      >
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4">{event.description}</p>

              <Link href={`/su-kien/${event.id}/${slugify(event.title)}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    );

  const figuresContent =
    !figures || figures.length === 0 ? (
      <div className="text-center py-10">
        <div className="text-gray-500 mb-4">
          <svg
            className="h-16 w-16 mx-auto opacity-25"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có nhân vật lịch sử</h3>
        <p className="text-gray-600">
          Chưa có nhân vật lịch sử nào được thêm vào thời kỳ này.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {figures.map((figure, index) => (
          <motion.div
            key={figure.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                src={
                  figure.imageUrl ||
                  "https://via.placeholder.com/400x250?text=Nhân+Vật+Lịch+Sử"
                }
                alt={figure.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-bold text-xl">{figure.name}</h3>
                  <p className="text-white/80 text-sm">{figure.lifespan}</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 line-clamp-3">{figure.description}</p>
              <Link href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    );

  const sitesContent =
    !sites || sites.length === 0 ? (
      <div className="text-center py-10">
        <div className="text-gray-500 mb-4">
          <MapPin className="h-16 w-16 mx-auto opacity-25" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có di tích lịch sử</h3>
        <p className="text-gray-600">
          Chưa có di tích lịch sử nào được thêm vào thời kỳ này.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {sites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                src={
                  site.imageUrl ||
                  "https://via.placeholder.com/400x250?text=Di+Tích+Lịch+Sử"
                }
                alt={site.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-bold text-xl">{site.name}</h3>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{site.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 line-clamp-3">{site.description}</p>
              <div className="mt-4 flex justify-between gap-2">
                {site.mapUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(site.mapUrl, "_blank")}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Bản đồ
                  </Button>
                )}
                <Link
                  href={`/di-tich/${site.id}/${slugify(site.name)}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] py-16 text-white">
        <div className="container mx-auto px-4">
          <Link href={`/?period=${period.slug}#timeline`}>
            <Button
              variant="outline"
              className="mb-6 text-black border-white bg-white/90 hover:bg-primary hover:text-white"
            >
              <ArrowLeft className="mr-2" />
              Trở về dòng thời gian
            </Button>
          </Link>

          <div className="flex items-center mb-4">
            <div className="mr-4 bg-white/20 p-3 rounded-full">
              {period.icon && (
                <span className="material-icons text-3xl">{period.icon}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] mb-2">
                {period.name}
              </h1>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-lg">{period.timeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Description card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
            Tổng quan
          </h2>
          <p className="text-gray-700 leading-relaxed">{period.description}</p>
        </div>

        {/* Tabs for different content types */}
        <Tabs
          defaultValue="events"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start bg-transparent p-0 mb-6">
            <TabsTrigger
              value="events"
              className={`${activeTab === "events" ? "border-b-2 border-[hsl(var(--primary))] rounded-none" : "border-b-2 border-transparent"} px-4 py-2`}
            >
              Các sự kiện ({events?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="figures"
              className={`${activeTab === "figures" ? "border-b-2 border-[hsl(var(--primary))] rounded-none" : "border-b-2 border-transparent"} px-4 py-2`}
            >
              Nhân vật lịch sử ({figures?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="sites"
              className={`${activeTab === "sites" ? "border-b-2 border-[hsl(var(--primary))] rounded-none" : "border-b-2 border-transparent"} px-4 py-2`}
            >
              Di tích lịch sử ({sites?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-0">
            {eventsContent}
          </TabsContent>

          <TabsContent value="figures" className="mt-0">
            {figuresContent}
          </TabsContent>

          <TabsContent value="sites" className="mt-0">
            {sitesContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

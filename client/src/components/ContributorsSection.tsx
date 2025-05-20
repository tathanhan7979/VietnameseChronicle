import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';

// Định nghĩa interface cho Contributor
interface Contributor {
  id: number;
  name: string;
  avatarUrl: string | null;
  description: string | null;
  role: string | null;
  contactInfo: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContributorsSection() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch("/api/contributors/active", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });

        if (!response.ok) {
          throw new Error("Lỗi khi tải danh sách người đóng góp");
        }

        const data = await response.json();
        console.log("Contributors data:", data);
        setContributors(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, []);

  if (isLoading) {
    return (
      <section id="contributors" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            Đội ngũ đóng góp
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (contributors.length === 0) {
    return null; // Không hiển thị phần này nếu không có người đóng góp
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section id="contributors" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-primary mb-4">Đội ngũ đóng góp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Những người tâm huyết góp phần xây dựng và phát triển nội dung về lịch sử Việt Nam
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex py-8">
              {contributors.map((contributor, index) => (
                <div 
                  key={contributor.id} 
                  className="flex-grow-0 flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`group text-center transition-all duration-300 ${selectedIndex === index ? 'scale-110 z-10' : 'scale-90 opacity-70'}`}
                  >
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col items-center p-4">
                      <div className="mb-4 relative">
                        <div className={`rounded-full overflow-hidden border-4 ${selectedIndex === index ? 'border-primary' : 'border-gray-200'} transition-all duration-300`}>
                          {contributor.avatarUrl ? (
                            <img
                              src={contributor.avatarUrl}
                              alt={contributor.name}
                              className="w-32 h-32 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/uploads/error-img.png";
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-primary/10">
                              <span className="text-5xl font-bold text-primary/50">
                                {contributor.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-xl mb-1">{contributor.name}</h3>
                      
                      <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium mb-3">
                        {contributor.role || "Thành viên"}
                      </div>
                      
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                        {contributor.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                      </p>
                      
                      <a 
                        href={contributor.contactInfo || "#"} 
                        className="inline-flex items-center text-sm font-medium text-white bg-primary rounded-full px-4 py-2 hover:bg-primary/90 transition-colors"
                      >
                        Liên hệ
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút điều hướng */}
          <button 
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Chỉ số dụng */}
        <div className="flex justify-center mt-6 space-x-2">
          {contributors.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === selectedIndex ? 'bg-primary w-6' : 'bg-gray-300'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
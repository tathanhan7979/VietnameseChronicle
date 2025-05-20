import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch danh sách contributor
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

  // Tự động chuyển slide mỗi 5 giây
  useEffect(() => {
    if (contributors.length > 0 && autoplay) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % contributors.length);
      }, 5000);

      return () => {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
        }
      };
    }
  }, [contributors, autoplay]);

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

  const pauseAutoplay = () => {
    setAutoplay(false);
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  const resumeAutoplay = () => {
    setAutoplay(true);
  };

  const goToPrev = () => {
    pauseAutoplay();
    setActiveIndex(prev => 
      prev === 0 ? contributors.length - 1 : prev - 1
    );
    resumeAutoplay();
  };

  const goToNext = () => {
    pauseAutoplay();
    setActiveIndex(prev => 
      prev === contributors.length - 1 ? 0 : prev + 1
    );
    resumeAutoplay();
  };

  // Tính toán các chỉ số để hiển thị trong carousel
  const getVisibleItems = () => {
    if (contributors.length <= 1) return [contributors[0]];
    
    // Nếu chỉ có 2 người đóng góp, hiển thị cả 2
    if (contributors.length === 2) return contributors;
    
    const result = [];
    const count = contributors.length;
    
    // Lấy người đóng góp hiện tại
    result.push(contributors[activeIndex]);
    
    // Lấy người đóng góp trước đó
    const prevIndex = activeIndex === 0 ? count - 1 : activeIndex - 1;
    result.unshift(contributors[prevIndex]);
    
    // Lấy người đóng góp tiếp theo
    const nextIndex = activeIndex === count - 1 ? 0 : activeIndex + 1;
    result.push(contributors[nextIndex]);
    
    return result;
  };

  const visibleItems = getVisibleItems();

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

        <div className="relative px-10">
          <div className="overflow-hidden">
            {/* Desktop view - 3 columns */}
            <div className="hidden md:flex justify-center items-center gap-4">
              {visibleItems.map((contributor, idx) => {
                const isCenter = idx === 1; // Phần tử ở giữa
                
                return (
                  <div 
                    key={contributor.id} 
                    className={`transition-all duration-500 ${
                      isCenter ? 'w-[40%]' : 'w-[30%]'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`group text-center transition-all duration-500 ${
                        isCenter ? 'scale-110 z-10' : 'scale-90 opacity-70'
                      }`}
                    >
                      <div className={`bg-white rounded-xl shadow-lg overflow-hidden border ${
                        isCenter ? 'border-primary/30' : 'border-gray-100'
                      } flex flex-col items-center p-6 transition-all duration-300`}>
                        <div className="mb-5 relative group">
                          <div className={`rounded-full overflow-hidden border-4 ${
                            isCenter ? 'border-primary' : 'border-gray-200'
                          } transition-all duration-300 group-hover:border-primary`}>
                            {contributor.avatarUrl ? (
                              <img
                                src={contributor.avatarUrl}
                                alt={contributor.name}
                                className={`w-32 h-32 object-cover transition-transform duration-500 ${
                                  isCenter ? 'scale-105' : ''
                                } group-hover:scale-110`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/uploads/error-img.png";
                                }}
                              />
                            ) : (
                              <div className="w-32 h-32 flex items-center justify-center bg-primary/10">
                                <span className="text-5xl font-bold text-primary/50">
                                  {contributor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          {isCenter && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 border-2 border-primary">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-xl mb-1 text-gray-800">{contributor.name}</h3>
                        
                        <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium mb-3">
                          {contributor.role || "Thành viên"}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed text-center">
                          {contributor.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                        </p>
                        
                        <a 
                          href={contributor.contactInfo || "#"} 
                          className={`inline-flex items-center text-sm font-medium text-white rounded-full px-4 py-2 hover:shadow-lg transition-all ${
                            isCenter ? 'bg-primary' : 'bg-primary/80'
                          }`}
                        >
                          Liên hệ
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Mobile view - 1 column */}
            <div className="md:hidden flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-xs"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary/30 flex flex-col items-center p-6">
                    <div className="mb-5 relative group">
                      <div className="rounded-full overflow-hidden border-4 border-primary transition-all duration-300">
                        {contributors[activeIndex].avatarUrl ? (
                          <img
                            src={contributors[activeIndex].avatarUrl}
                            alt={contributors[activeIndex].name}
                            className="w-28 h-28 object-cover transition-transform duration-500 scale-105 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/uploads/error-img.png";
                            }}
                          />
                        ) : (
                          <div className="w-28 h-28 flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary/50">
                              {contributors[activeIndex].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 border-2 border-primary">
                        <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-1 text-gray-800">{contributors[activeIndex].name}</h3>
                    
                    <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium mb-3">
                      {contributors[activeIndex].role || "Thành viên"}
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed text-center">
                      {contributors[activeIndex].description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                    </p>
                    
                    <a 
                      href={contributors[activeIndex].contactInfo || "#"} 
                      className="inline-flex items-center text-sm font-medium text-white rounded-full px-4 py-2 hover:shadow-lg transition-all bg-primary"
                    >
                      Liên hệ
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Nút điều hướng */}
          <button 
            onClick={goToPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 hover:scale-110 transition-all duration-300 border border-gray-100"
            aria-label="Xem người đóng góp trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 hover:scale-110 transition-all duration-300 border border-gray-100"
            aria-label="Xem người đóng góp tiếp theo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Chỉ số hiển thị */}
        <div className="flex justify-center mt-8 space-x-2">
          {contributors.map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 focus:outline-none ${
                index === activeIndex 
                  ? 'bg-primary w-8 h-3 rounded-full' 
                  : 'bg-gray-300 w-3 h-3 rounded-full hover:bg-gray-400'
              }`}
              onClick={() => {
                pauseAutoplay();
                setActiveIndex(index);
                resumeAutoplay();
              }}
              aria-label={`Xem người đóng góp ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
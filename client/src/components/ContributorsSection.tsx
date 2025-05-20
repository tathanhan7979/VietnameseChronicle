import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// Gỡ bỏ embla-carousel để tránh lỗi

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

  // AutoPlay Carousel
  // Tự động chuyển slide mỗi 5 giây
  useEffect(() => {
    if (contributors && contributors.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex(prevIndex => 
          prevIndex === contributors.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [contributors]);

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

  const goToPrev = () => {
    setActiveIndex(prev => 
      prev === 0 ? contributors.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setActiveIndex(prev => 
      prev === contributors.length - 1 ? 0 : prev + 1
    );
  };

  // Kiểm tra và trả về một mảng trống nếu chưa có dữ liệu người đóng góp
  const getVisibleContributors = () => {
    if (!contributors || contributors.length === 0) {
      return [];
    }
    
    const result = [];
    
    // Previous
    const prevIndex = activeIndex === 0 ? contributors.length - 1 : activeIndex - 1;
    result.push({ contributor: contributors[prevIndex], position: 'prev' });
    
    // Active
    result.push({ contributor: contributors[activeIndex], position: 'active' });
    
    // Next
    const nextIndex = activeIndex === contributors.length - 1 ? 0 : activeIndex + 1;
    result.push({ contributor: contributors[nextIndex], position: 'next' });
    
    return result;
  };

  const visibleContributors = contributors.length > 0 ? getVisibleContributors() : [];

  return (
    <section id="contributors" className="py-16 bg-gradient-to-b from-white to-gray-50 relative z-10">
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

        <div className="relative my-10 py-10 overflow-hidden">
          <div className="relative max-w-4xl mx-auto" style={{ height: '350px' }}>
            {contributors.length > 0 && (
              <div className="flex justify-center items-center h-full">
                {activeIndex > 0 && (
                  <div 
                    className="hidden md:block absolute left-0 transform -translate-x-1/2 scale-75 opacity-70 z-10"
                    style={{ left: "15%" }}
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col items-center p-4 w-56">
                      <div className="mb-3">
                        <div className="rounded-full overflow-hidden border-4 border-gray-200">
                          {contributors[activeIndex > 0 ? activeIndex - 1 : contributors.length - 1].avatarUrl ? (
                            <img
                              src={contributors[activeIndex > 0 ? activeIndex - 1 : contributors.length - 1].avatarUrl}
                              alt={contributors[activeIndex > 0 ? activeIndex - 1 : contributors.length - 1].name}
                              className="w-20 h-20 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/uploads/error-img.png";
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 flex items-center justify-center bg-primary/10">
                              <span className="text-3xl font-bold text-primary/50">
                                {contributors[activeIndex > 0 ? activeIndex - 1 : contributors.length - 1].name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-gray-800">{contributors[activeIndex > 0 ? activeIndex - 1 : contributors.length - 1].name}</h3>
                    </div>
                  </div>
                )}

                <div className="absolute z-30 transform scale-100 opacity-100"
                  style={{ left: "50%", transform: "translateX(-50%)" }}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary flex flex-col items-center p-6 w-64 md:w-72">
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col items-center p-6 w-64 md:w-80">
                    <div className="mb-5 relative">
                      <div className={`rounded-full overflow-hidden border-4 ${position === 'active' ? 'border-primary' : 'border-gray-200'} transition-all duration-300`}>
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
                              {contributor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {position === 'active' && (
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
                      className={`inline-flex items-center text-sm font-medium text-white rounded-full px-4 py-2 hover:shadow-md transition-all ${position === 'active' ? 'bg-primary' : 'bg-primary/80'}`}
                    >
                      Liên hệ
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards (chỉ hiện 1 card trên mobile) */}
          <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                {contributors.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary/30 flex flex-col items-center p-6">
                    <div className="mb-5 relative">
                      <div className="rounded-full overflow-hidden border-4 border-primary">
                        {contributors[activeIndex].avatarUrl ? (
                          <img
                            src={contributors[activeIndex].avatarUrl}
                            alt={contributors[activeIndex].name}
                            className="w-24 h-24 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/uploads/error-img.png";
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary/50">
                              {contributors[activeIndex].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{contributors[activeIndex].name}</h3>
                    
                    <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium mb-3">
                      {contributors[activeIndex].role || "Thành viên"}
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed text-center">
                      {contributors[activeIndex].description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                    </p>
                    
                    <a 
                      href={contributors[activeIndex].contactInfo || "#"} 
                      className="inline-flex items-center text-sm font-medium text-white bg-primary rounded-full px-4 py-2 hover:shadow-md transition-all"
                    >
                      Liên hệ
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nút điều hướng */}
          <button 
            onClick={goToPrev}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-md z-20 hover:scale-110 transition-transform duration-300"
            aria-label="Xem người đóng góp trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-md z-20 hover:scale-110 transition-transform duration-300"
            aria-label="Xem người đóng góp tiếp theo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Chỉ số hiển thị */}
        <div className="flex justify-center mt-6 space-x-3">
          {contributors.map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary w-8 h-3 rounded-full' 
                  : 'bg-gray-300 w-3 h-3 rounded-full hover:bg-gray-400'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem người đóng góp ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
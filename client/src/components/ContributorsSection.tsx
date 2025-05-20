import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/ui/optimized-image";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (contributors.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % contributors.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [contributors]);

  // Xử lý khi click vào nút prev
  const handlePrev = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? contributors.length - 1 : prevIndex - 1
    );
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % contributors.length);
    }, 5000);
  };

  // Xử lý khi click vào nút next
  const handleNext = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % contributors.length
    );
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % contributors.length);
    }, 5000);
  };

  // Xử lý khi click vào các indicator
  const handleIndicatorClick = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentIndex(index);
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % contributors.length);
    }, 5000);
  };

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
    return null;
  }

  // Tạo mảng 3 phần tử để hiển thị (luôn luôn đủ 3 phần tử)
  const getVisibleItems = () => {
    const result = [];
    
    if (contributors.length === 1) {
      // Nếu chỉ có 1 người đóng góp, lặp lại 3 lần
      result.push(contributors[0], contributors[0], contributors[0]);
    } else if (contributors.length === 2) {
      // Nếu có 2 người đóng góp, hiển thị lần lượt người 1, người 2, người 1
      const firstItem = contributors[currentIndex % 2];
      const secondItem = contributors[(currentIndex + 1) % 2];
      result.push(secondItem, firstItem, secondItem);
    } else {
      // Nếu có từ 3 người trở lên, hiển thị 3 người liên tiếp
      const prevIndex = currentIndex === 0 ? contributors.length - 1 : currentIndex - 1;
      const nextIndex = (currentIndex + 1) % contributors.length;
      result.push(contributors[prevIndex], contributors[currentIndex], contributors[nextIndex]);
    }
    
    return result;
  };

  const visibleItems = getVisibleItems();

  return (
    <section id="contributors" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Đội ngũ đóng góp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Những người tâm huyết góp phần xây dựng và phát triển nội dung về lịch sử Việt Nam
          </p>
        </div>

        <div className="relative px-12">
          {/* Carousel */}
          <div className="overflow-visible py-10">
            {/* Desktop View - 3 columns */}
            <div className="hidden md:flex justify-center items-stretch gap-4 min-h-[400px]">
              {visibleItems.map((contributor, idx) => {
                const isCenter = idx === 1; // Phần tử ở giữa
                
                return (
                  <div 
                    key={`${contributor.id}-${idx}`}
                    className={`transition-all duration-500 ${
                      isCenter ? 'w-[38%]' : 'w-[31%]'
                    }`}
                  >
                    <div 
                      className={`text-center transition-all duration-500 ${
                        isCenter 
                          ? 'scale-110 z-10 translate-y-0 shadow-xl' 
                          : 'scale-90 opacity-80 translate-y-5'
                      }`}
                    >
                      <div className={`bg-white rounded-xl overflow-hidden border flex flex-col items-center p-6 h-full ${
                        isCenter 
                          ? 'border-primary/30 shadow-lg py-8' 
                          : 'border-gray-100'
                      }`}>
                        <div className="mb-6 relative">
                          <div className={`rounded-full overflow-hidden border-4 ${
                            isCenter ? 'border-primary w-36 h-36' : 'border-gray-200 w-28 h-28'
                          } transition-all duration-300 hover:border-primary`}>
                            {contributor.avatarUrl ? (
                              <OptimizedImage
                                src={contributor.avatarUrl}
                                alt={contributor.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                fallbackSrc="/uploads/error-img.png"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <span className={`font-bold text-primary/50 ${
                                  isCenter ? 'text-5xl' : 'text-4xl'
                                }`}>
                                  {contributor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          {isCenter && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 border-2 border-primary">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <h3 className={`font-bold mb-2 text-gray-800 ${
                          isCenter ? 'text-2xl' : 'text-xl'
                        }`}>
                          {contributor.name}
                        </h3>
                        
                        <div className="bg-primary/5 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-4">
                          {contributor.role || "Thành viên"}
                        </div>
                        
                        <div className="flex-grow w-full mb-6">
                          <p className={`text-gray-600 leading-relaxed text-center ${
                            isCenter ? 'line-clamp-none' : 'line-clamp-3 text-sm'
                          }`}>
                            {contributor.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                          </p>
                        </div>
                        
                        <a 
                          href={contributor.contactInfo || "#"} 
                          className={`inline-flex items-center font-medium text-white rounded-full px-5 py-2.5 hover:shadow-lg transition-all ${
                            isCenter 
                              ? 'bg-primary text-base' 
                              : 'bg-primary/80 text-sm'
                          }`}
                        >
                          Liên hệ
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View - 1 column */}
            <div className="md:hidden">
              <div className="max-w-sm mx-auto">
                <div 
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary/30 flex flex-col items-center p-8"
                >
                  <div className="mb-6 relative">
                    <div className="rounded-full overflow-hidden border-4 border-primary transition-all duration-300 w-32 h-32">
                      {contributors[currentIndex].avatarUrl ? (
                        <OptimizedImage
                          src={contributors[currentIndex].avatarUrl}
                          alt={contributors[currentIndex].name}
                          className="w-full h-full object-cover transition-transform duration-300 scale-105 hover:scale-110"
                          fallbackSrc="/uploads/error-img.png"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-5xl font-bold text-primary/50">
                            {contributors[currentIndex].name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 border-2 border-primary">
                      <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-2xl mb-2 text-gray-800">{contributors[currentIndex].name}</h3>
                  
                  <div className="bg-primary/5 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-4">
                    {contributors[currentIndex].role || "Thành viên"}
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-center">
                    {contributors[currentIndex].description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                  </p>
                  
                  <a 
                    href={contributors[currentIndex].contactInfo || "#"} 
                    className="inline-flex items-center text-base font-medium text-white rounded-full px-5 py-2.5 hover:shadow-lg transition-all bg-primary"
                  >
                    Liên hệ
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Nút điều hướng */}
          <button 
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-primary rounded-full w-12 h-12 flex items-center justify-center z-10 hover:bg-gray-50 hover:scale-110 border border-gray-200 focus:outline-none transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-primary rounded-full w-12 h-12 flex items-center justify-center z-10 hover:bg-gray-50 hover:scale-110 border border-gray-200 focus:outline-none transition-all duration-300"
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
              onClick={() => handleIndicatorClick(index)}
              className={`transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-10 h-3 rounded-full' 
                  : 'bg-gray-300 w-3 h-3 rounded-full hover:bg-gray-400'
              } focus:outline-none`}
              aria-label={`Xem người đóng góp ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
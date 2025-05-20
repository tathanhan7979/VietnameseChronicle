import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  // Tính toán các vị trí trước và sau cho carousel
  const getPrevIndex = () => {
    return activeIndex === 0 ? contributors.length - 1 : activeIndex - 1;
  };

  const getNextIndex = () => {
    return activeIndex === contributors.length - 1 ? 0 : activeIndex + 1;
  };

  return (
    <section id="contributors" className="py-16 bg-gradient-to-b from-white to-gray-50 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-primary mb-4">Đội ngũ đóng góp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Những người tâm huyết góp phần xây dựng và phát triển nội dung về lịch sử Việt Nam
          </p>
        </motion.div>

        {/* Carousel hiển thị 3 thẻ (trước - hiện tại - sau) */}
        <div className="relative mx-auto mb-10" style={{ minHeight: "400px" }}>
          <div className="flex justify-center items-center h-full">
            {/* Thẻ bên trái (previous) */}
            <div 
              className="hidden md:block absolute left-0 transform -translate-x-1/2 scale-75 opacity-70 z-10"
              style={{ left: "25%" }}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4 w-56">
                <div className="flex flex-col items-center">
                  <div className="mb-3">
                    <div className="rounded-full overflow-hidden border-4 border-gray-200">
                      {contributors[getPrevIndex()]?.avatarUrl ? (
                        <img
                          src={contributors[getPrevIndex()].avatarUrl}
                          alt={contributors[getPrevIndex()].name}
                          className="w-20 h-20 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/uploads/error-img.png";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-primary/10">
                          <span className="text-3xl font-bold text-primary/50">
                            {contributors[getPrevIndex()]?.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 text-center">
                    {contributors[getPrevIndex()]?.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Thẻ hiện tại (active) */}
            <div 
              className="absolute transform scale-100 opacity-100 z-30"
              style={{ left: "50%", transform: "translateX(-50%)" }}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary p-6 w-72 md:w-80">
                <div className="flex flex-col items-center">
                  <div className="mb-5 relative">
                    <div className="rounded-full overflow-hidden border-4 border-primary">
                      {contributors[activeIndex]?.avatarUrl ? (
                        <img
                          src={contributors[activeIndex].avatarUrl}
                          alt={contributors[activeIndex].name}
                          className="w-32 h-32 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/uploads/error-img.png";
                          }}
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-primary/10">
                          <span className="text-5xl font-bold text-primary/50">
                            {contributors[activeIndex]?.name?.charAt(0)?.toUpperCase() || "?"}
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
                  
                  <h3 className="font-bold text-xl mb-1 text-gray-800">
                    {contributors[activeIndex]?.name}
                  </h3>
                  
                  <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium mb-3">
                    {contributors[activeIndex]?.role || "Thành viên"}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed text-center">
                    {contributors[activeIndex]?.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                  </p>
                  
                  <a 
                    href={contributors[activeIndex]?.contactInfo || "#"} 
                    className="inline-flex items-center text-sm font-medium text-white bg-primary rounded-full px-4 py-2 hover:shadow-md transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Liên hệ
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Thẻ bên phải (next) */}
            <div 
              className="hidden md:block absolute right-0 transform translate-x-1/2 scale-75 opacity-70 z-10"
              style={{ right: "25%" }}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4 w-56">
                <div className="flex flex-col items-center">
                  <div className="mb-3">
                    <div className="rounded-full overflow-hidden border-4 border-gray-200">
                      {contributors[getNextIndex()]?.avatarUrl ? (
                        <img
                          src={contributors[getNextIndex()].avatarUrl}
                          alt={contributors[getNextIndex()].name}
                          className="w-20 h-20 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/uploads/error-img.png";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-primary/10">
                          <span className="text-3xl font-bold text-primary/50">
                            {contributors[getNextIndex()]?.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 text-center">
                    {contributors[getNextIndex()]?.name}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Nút điều hướng */}
          <button 
            onClick={goToPrev}
            className="absolute left-2 md:left-10 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-md z-20 hover:scale-110 transition-all"
            aria-label="Xem người đóng góp trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 md:right-10 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-md z-20 hover:scale-110 transition-all"
            aria-label="Xem người đóng góp tiếp theo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Chỉ số hiển thị */}
        <div className="flex justify-center mt-4 space-x-2">
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
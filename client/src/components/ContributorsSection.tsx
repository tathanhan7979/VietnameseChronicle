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

  return (
    <section id="contributors" className="py-16 bg-gray-50 relative">
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

        {contributors.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 relative">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="mb-6">
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
                      <div className="w-32 h-32 flex items-center justify-center bg-gray-100">
                        <span className="text-4xl font-bold text-primary/50">
                          {contributors[activeIndex]?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thông tin */}
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  {contributors[activeIndex]?.name || ""}
                </h3>
                
                <div className="bg-primary/10 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-4">
                  {contributors[activeIndex]?.role || "Thành viên"}
                </div>
                
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  {contributors[activeIndex]?.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                </p>
                
                <a 
                  href={contributors[activeIndex]?.contactInfo || "#"} 
                  className="inline-flex items-center text-sm font-medium text-white bg-primary rounded-full px-5 py-2.5 hover:bg-primary/90 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Liên hệ
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </a>
              </div>
              
              {/* Nút điều hướng */}
              {contributors.length > 1 && (
                <>
                  <button 
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50"
                    aria-label="Xem người đóng góp trước"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50"
                    aria-label="Xem người đóng góp tiếp theo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Chỉ số hiển thị */}
            {contributors.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {contributors.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeIndex ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Xem người đóng góp ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
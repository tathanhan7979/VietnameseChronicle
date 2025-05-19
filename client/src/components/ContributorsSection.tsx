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

  return (
    <section id="contributors" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-primary mb-4">Đội ngũ đóng góp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Những người tâm huyết góp phần xây dựng và phát triển nội dung về lịch sử Việt Nam
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100">
                <div className="relative h-52 overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
                  {contributor.avatarUrl ? (
                    <img
                      src={contributor.avatarUrl}
                      alt={contributor.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/uploads/error-img.png";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-5xl font-bold text-primary/20">
                        {contributor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 transform transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="font-bold text-xl text-white drop-shadow-sm">{contributor.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 text-sm line-clamp-3 h-16 leading-relaxed">
                    {contributor.description || "Người đóng góp cho dự án phát triển lịch sử Việt Nam"}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="bg-primary/5 rounded-full px-3 py-1 text-sm text-primary font-medium">
                      {contributor.role || "Thành viên"}
                    </div>
                    <div className="group-hover:translate-x-0 translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="inline-flex items-center text-sm font-medium text-primary">
                        Chi tiết
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
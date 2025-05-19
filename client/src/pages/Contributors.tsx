import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Contributor } from "@shared/schema";
import { Loader2, Mail, Globe } from "lucide-react";

export default function ContributorsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("");

  // Query để lấy danh sách người đóng góp hoạt động
  const { data: contributors, isLoading, error } = useQuery({
    queryKey: ["/api/contributors/active"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contributors/active");
      if (!res.ok) {
        throw new Error("Không thể tải danh sách người đóng góp");
      }
      return await res.json();
    },
  });

  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người đóng góp",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <>
      <Helmet>
        <title>Những người đóng góp | Lịch Sử Việt Nam</title>
        <meta
          name="description"
          content="Danh sách những người đã đóng góp xây dựng website Lịch Sử Việt Nam"
        />
        <meta
          property="og:title"
          content="Những người đóng góp | Lịch Sử Việt Nam"
        />
        <meta
          property="og:description"
          content="Danh sách những người đã đóng góp xây dựng website Lịch Sử Việt Nam"
        />
        <meta
          property="og:image"
          content="https://lichsuviet.edu.vn/uploads/banner-image.png"
        />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header
          onOpenSearch={() => {}}
          activeSection={activeSection}
          onSectionSelect={(sectionId) => setActiveSection(sectionId)}
        />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4">Những người đóng góp</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Chúng tôi xin chân thành cảm ơn tất cả những cá nhân đã đóng góp vào việc xây dựng
                và phát triển website Lịch Sử Việt Nam.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contributors && contributors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contributors.map((contributor: Contributor) => (
                  <ContributorCard key={contributor.id} contributor={contributor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  Thông tin về những người đóng góp đang được cập nhật.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          {contributor.avatarUrl ? (
            <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-primary">
              <img
                src={contributor.avatarUrl}
                alt={contributor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/uploads/error-img.png";
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-primary bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {contributor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">{contributor.name}</h3>
            <p className="text-primary">{contributor.role}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">{contributor.description}</p>
        </div>

        {contributor.contactInfo && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center">
            {contributor.contactInfo.includes("@") ? (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-1" />
                <span>{contributor.contactInfo}</span>
              </div>
            ) : contributor.contactInfo.includes("http") ? (
              <a
                href={contributor.contactInfo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>Website</span>
              </a>
            ) : (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{contributor.contactInfo}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
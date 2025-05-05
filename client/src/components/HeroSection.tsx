import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Users, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import FeedbackModal from "./FeedbackModal";

interface HeroSectionProps {
  onStartExplore?: () => void;
}

export default function HeroSection({ onStartExplore }: HeroSectionProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState(
    "https://images.unsplash.com/photo-1624009582782-1be02fbb7f23?q=80&w=2071&auto=format&fit=crop"
  );

  // Lấy URL ảnh nền từ settings
  const { data: homeBgSetting } = useQuery({
    queryKey: ["/api/settings/home_background_url"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/settings/home_background_url");
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error("Không thể lấy URL ảnh nền:", error);
        return null;
      }
    }
  });

  // Cập nhật URL ảnh nền khi có dữ liệu từ settings
  useEffect(() => {
    if (homeBgSetting?.value) {
      setBackgroundUrl(homeBgSetting.value);
    }
  }, [homeBgSetting]);

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFeedbackModalOpen(true);
  };

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStartExplore) {
      onStartExplore();
    }
  };

  // Quick navigation cards for important sections
  const quickNavItems = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Dòng thời gian",
      link: "#timeline",
      color: "from-red-600 to-red-800",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Nhân vật lịch sử",
      link: "#historical-figures",
      color: "from-indigo-600 to-indigo-900",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Di tích lịch sử",
      link: "#historical-sites",
      color: "from-amber-500 to-amber-700",
    },
  ];

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <picture>
            <img 
              src={backgroundUrl} 
              alt="Lịch sử Việt Nam"
              className="absolute inset-0 w-full h-full object-cover transform scale-110"
              style={{
                filter: "brightness(0.6)",
                transformOrigin: "center",
              }}
              fetchpriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80"></div>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="container mx-auto px-4 pt-16 pb-8 flex flex-col justify-center items-center text-center">
            <motion.h1
              className="font-['Playfair_Display'] font-bold text-4xl md:text-7xl text-white mb-6 max-w-5xl leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Hành Trình <span className="text-red-500">4000 Năm</span> <br />
              Lịch Sử Việt Nam
            </motion.h1>

            <motion.p
              className="font-['Montserrat'] text-xl text-gray-200 max-w-2xl mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Khám phá hành trình vẻ vang từ thời Vua Hùng dựng nước đến nền
              cộng hòa hiện đại
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row gap-6 justify-center mt-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <a
                href="#feedback"
                onClick={handleFeedbackClick}
                className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white px-8 py-4 rounded-md font-['Montserrat'] text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Góp Ý Xây Dựng
                <MessageSquare className="h-5 w-5 ml-1" />
              </a>
            </motion.div>

            {/* Quick navigation cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {quickNavItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl group hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
                >
                  <div
                    className={`bg-gradient-to-br ${item.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-white font-medium">{item.title}</span>
                  <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white" />
                </a>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Overlay decoration - pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMGEzMCAzMCAwIDEgMCAwIDYwIDMwIDMwIDAgMCAwIDAtNjB6TTEwIDMwYTIwIDIwIDAgMSAxIDQwIDAgMjAgMjAgMCAwIDEtNDAgMHoiIG9wYWNpdHk9Ii4wNSIgLz48L3N2Zz4=')] opacity-30 pointer-events-none z-5"></div>
      </div>
    </section>
  );
}

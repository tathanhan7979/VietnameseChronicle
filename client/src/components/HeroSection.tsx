import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onStartExplore?: () => void;
}

export default function HeroSection({ onStartExplore }: HeroSectionProps) {
  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStartExplore) {
      onStartExplore();
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-20 md:pt-24 flex items-center">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1583417319588-4dbde2e0a2d5?q=80&w=2070')" 
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-16 flex flex-col justify-center relative z-20 text-white text-center md:text-left">
        <div className="md:max-w-3xl">
          <motion.h1 
            className="font-['Playfair_Display'] font-bold text-4xl md:text-6xl lg:text-7xl mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Hành Trình <span className="text-[#F44336]">4000 Năm</span> Lịch Sử
          </motion.h1>
          
          <motion.p 
            className="font-['Montserrat'] text-lg md:text-xl max-w-2xl mb-10 text-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Từ thời đại các Vua Hùng dựng nước đến nền cộng hòa hiện đại - khám phá hành trình lịch sử hào hùng của dân tộc Việt Nam qua các triều đại và sự kiện quan trọng.
          </motion.p>
          
          <motion.div
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a 
              href="#timeline" 
              onClick={handleExploreClick}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-8 py-3 rounded-md font-['Montserrat'] text-lg transition-colors flex items-center justify-center md:justify-start gap-2 shadow-lg hover:shadow-xl"
            >
              Khám Phá Ngay
              <ArrowRight className="h-5 w-5" />
            </a>
            
            <a 
              href="#historical-figures" 
              className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-md font-['Montserrat'] text-lg hover:bg-white/10 transition-colors flex items-center justify-center md:justify-start gap-2"
            >
              Nhân Vật Lịch Sử
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <ArrowDownCircle className="h-10 w-10 text-white animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}

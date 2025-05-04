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
    <section id="home" className="relative overflow-hidden">
      {/* Hero Main */}
      <div className="relative min-h-screen pt-20 md:pt-24 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
        
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1551634979-2b11f8c218a7?q=80&w=1974&auto=format&fit=crop')" 
          }}
        ></div>
        
        <div className="container mx-auto px-4 py-16 flex flex-col justify-center relative z-20 text-white md:text-left min-h-[calc(100vh-6rem)]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div
                className="text-sm font-medium mb-3 inline-block rounded-full bg-red-600/20 px-3 py-1 border border-red-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-red-200">Di Sản Văn Hóa Việt Nam</span>
              </motion.div>
              
              <motion.h1 
                className="font-['Playfair_Display'] font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                Hành Trình <span className="text-[#F44336]">4000 Năm</span> Lịch Sử Việt Nam
              </motion.h1>
              
              <motion.p 
                className="font-['Montserrat'] text-lg md:text-xl max-w-2xl mb-10 text-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Từ thời đại các Vua Hùng dựng nước đến nền cộng hòa hiện đại — khám phá hành trình lịch sử hào hùng của dân tộc Việt Nam qua các triều đại và sự kiện quan trọng.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <a 
                  href="#timeline" 
                  onClick={handleExploreClick}
                  className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-8 py-3 rounded-md font-['Montserrat'] text-lg transition-all flex items-center justify-center sm:justify-start gap-2 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]"
                >
                  Khám Phá Ngay
                  <ArrowRight className="h-5 w-5" />
                </a>
                
                <a 
                  href="#historical-figures" 
                  className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-md font-['Montserrat'] text-lg hover:bg-white/10 transition-all flex items-center justify-center sm:justify-start gap-2 transform hover:translate-y-[-2px]"
                >
                  Nhân Vật Lịch Sử
                </a>
              </motion.div>
            </div>
            
            <motion.div 
              className="hidden md:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1575340245098-740517a5944e?q=80&w=1770&auto=format&fit=crop" 
                  alt="Hình ảnh lịch sử Việt Nam" 
                  className="object-cover rounded-lg h-[400px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-['Playfair_Display'] font-bold">Di Sản Văn Hóa Phi Vật Thể</h3>
                  <p className="text-gray-200 mt-1">Khám phá những giá trị văn hóa phi vật thể đã được UNESCO công nhận</p>
                </div>
              </div>
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
      </div>
    </section>
  );
}

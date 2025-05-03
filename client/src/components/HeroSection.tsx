import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Search, Clock, MapPin } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="overview" className="relative h-screen pt-16 overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10"></div>
      
      {/* Hero Background with parallax effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1583417319588-4dbde2e0a2d5?q=80&w=2070')" 
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      ></motion.div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20 text-white text-center">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-1/4 left-0 w-32 h-32 rounded-full bg-red-500/10 blur-3xl"
          animate={{ x: [-20, 20], y: [-10, 10] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-0 w-40 h-40 rounded-full bg-yellow-500/10 blur-3xl"
          animate={{ x: [20, -20], y: [10, -10] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <span className="px-3 py-1 bg-red-600/20 text-red-200 rounded-full text-sm font-medium inline-block mb-4">
            Lịch Sử Việt Nam
          </span>
        </motion.div>
        
        <motion.h1 
          className="font-['Playfair_Display'] font-bold text-4xl md:text-6xl lg:text-7xl mb-6 drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Hành Trình <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">4000 Năm</span> Lịch Sử
        </motion.h1>
        
        <motion.p 
          className="font-['Noto_Serif'] text-lg md:text-xl lg:text-2xl max-w-3xl mb-10 text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Từ thời đại các Vua Hùng dựng nước đến nền cộng hòa hiện đại - khám phá hành trình lịch sử hào hùng của dân tộc Việt Nam.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Khám Phá Ngay
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 py-6 rounded-full font-medium text-lg"
            onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Search className="mr-2 h-5 w-5" />
            Tìm Kiếm
          </Button>
        </motion.div>
        
        {/* Feature badges */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-10 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 mr-2 text-amber-400" />
            <span className="text-sm">Timeline Tương Tác</span>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4 mr-2 text-amber-400" />
            <span className="text-sm">Di Tích Lịch Sử</span>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <svg className="h-4 w-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            <span className="text-sm">Nhân Vật Lịch Sử</span>
          </div>
        </motion.div>
        
        {/* Scroll down indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <a 
            href="#timeline" 
            className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-sm mb-2">Cuộn xuống</span>
            <ArrowDown className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

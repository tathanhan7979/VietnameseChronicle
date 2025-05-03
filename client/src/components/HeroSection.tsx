import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section id="overview" className="relative h-screen pt-16">
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
      
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1583417319588-4dbde2e0a2d5?q=80&w=2070')" 
        }}
      ></div>
      
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20 text-white text-center">
        <motion.h1 
          className="font-['Playfair_Display'] font-bold text-4xl md:text-6xl lg:text-7xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Hành Trình <span className="text-[hsl(var(--secondary))]">4000 Năm</span> Lịch Sử
        </motion.h1>
        
        <motion.p 
          className="font-['Noto_Serif'] text-xl md:text-2xl max-w-3xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Từ thời đại các Vua Hùng dựng nước đến nền cộng hòa hiện đại - khám phá hành trình lịch sử hào hùng của dân tộc Việt Nam.
        </motion.p>
        
        <motion.a 
          href="#timeline" 
          className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-full font-['Montserrat'] text-lg hover:bg-opacity-90 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Khám Phá Ngay
        </motion.a>
        
        <div className="scroll-indicator">
          <span className="material-icons text-4xl text-white">keyboard_arrow_down</span>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { HistoricalFigure } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function HistoricalFiguresSection() {
  const [visibleCount, setVisibleCount] = useState(6);
  
  const { data: figures, isLoading } = useQuery<HistoricalFigure[]>({
    queryKey: ['/api/historical-figures'],
  });
  
  const handleLoadMore = () => {
    if (figures) {
      setVisibleCount(prev => Math.min(prev + 6, figures.length));
    }
  };
  
  if (isLoading) {
    return (
      <section id="figures" className="bg-[hsl(var(--foreground))] py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--secondary))] mb-16">
            Đang tải dữ liệu nhân vật...
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[hsl(var(--secondary))] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!figures || figures.length === 0) {
    return (
      <section id="figures" className="bg-[hsl(var(--foreground))] py-24">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--secondary))] mb-8">
            Không tìm thấy dữ liệu nhân vật
          </h2>
        </div>
      </section>
    );
  }
  
  return (
    <section id="figures" className="bg-[hsl(var(--foreground))] py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[hsl(var(--secondary))] text-center mb-16">
          Những <span className="text-white">Nhân Vật Lịch Sử</span> Tiêu Biểu
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {figures.slice(0, visibleCount).map((figure) => (
            <motion.div 
              key={figure.id} 
              className="card-flip h-96"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="card-front bg-[hsl(var(--background))] rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <img 
                  src={figure.imageUrl} 
                  alt={figure.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-['Playfair_Display'] font-bold text-xl text-[hsl(var(--primary))]">
                    {figure.name}
                  </h3>
                  <p className="text-[hsl(var(--foreground))]">{figure.lifespan}</p>
                  <div className="mt-2 flex">
                    <span className="bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))] px-3 py-1 rounded-full text-sm">
                      {figure.period}
                    </span>
                  </div>
                  <div className="mt-auto pt-3">
                    <Link href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`} className="inline-flex items-center text-[hsl(var(--primary))] hover:underline">
                      Xem chi tiết
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card-back bg-[hsl(var(--primary))] text-white rounded-lg shadow-lg p-6 flex flex-col h-full">
                <h3 className="font-['Playfair_Display'] font-bold text-xl mb-2">{figure.name}</h3>
                <p className="mb-2 text-sm">{figure.description}</p>
                {figure.achievements && figure.achievements.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-bold text-sm mb-1">Chiến công tiêu biểu:</h4>
                    <ul className="list-disc list-inside text-sm">
                      {figure.achievements.slice(0, 3).map((achievement, index) => (
                        <li key={index}>{achievement.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto pt-3">
                  <Link href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`} className="inline-flex items-center bg-black text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors">
                    Xem chi tiết
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {visibleCount < (figures?.length || 0) && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="inline-block bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] px-8 py-3 rounded-full font-['Montserrat'] text-lg hover:bg-opacity-90 transition-colors duration-300"
            >
              Xem Thêm Nhân Vật
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

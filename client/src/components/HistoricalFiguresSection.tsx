import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { HistoricalFigure, PeriodData } from '@/lib/types';
import { ChevronRight, UserIcon, Award, Users } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface HistoricalFiguresSectionProps {
  figures?: HistoricalFigure[];
  periods?: PeriodData[];
}

export default function HistoricalFiguresSection({ figures: propFigures, periods: propPeriods }: HistoricalFiguresSectionProps = {}) {
  const [visibleCount] = useState(6);
  const [, navigate] = useLocation();
  
  const { data: queryFigures, isLoading: isLoadingFigures } = useQuery<HistoricalFigure[]>({
    queryKey: ['/api/historical-figures'],
  });
  
  const { data: queryPeriods, isLoading: isLoadingPeriods } = useQuery<PeriodData[]>({
    queryKey: ['/api/periods'],
  });

  // Use provided figures or query results and randomize them
  const [randomizedFigures, setRandomizedFigures] = useState<HistoricalFigure[]>([]);
  
  useEffect(() => {
    const allFigures = propFigures || queryFigures;
    if (!allFigures || allFigures.length === 0) return;
    
    // Create a copy to avoid mutating the original data
    const shuffled = [...allFigures];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setRandomizedFigures(shuffled);
  }, [propFigures, queryFigures]);
  
  const figures = randomizedFigures;
  
  const handleViewAllFigures = () => {
    navigate('/nhan-vat');
  };
  
  const isLoading = isLoadingFigures || isLoadingPeriods;
  const periods = propPeriods || queryPeriods || [];
  
  if ((isLoadingFigures && !propFigures) || (isLoadingPeriods && !propPeriods)) {
    return (
      <section id="historical-figures" className="bg-gray-100 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#4527A0] mb-16">
            Đang tải dữ liệu nhân vật...
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[#4527A0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!figures || figures.length === 0) {
    return (
      <section id="historical-figures" className="bg-gray-100 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#4527A0] mb-8">
            Không tìm thấy dữ liệu nhân vật
          </h2>
        </div>
      </section>
    );
  }
  
  return (
    <section id="historical-figures" className="bg-gray-100 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#4527A0] inline-flex items-center justify-center gap-3">
            <Users className="h-8 w-8" />
            <span className="cursor-pointer hover:underline" onClick={handleViewAllFigures}>
              Những Nhân Vật <span className="text-[#C62828]">Lịch Sử Tiêu Biểu</span>
            </span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Tìm hiểu về những nhân vật đã đóng góp và định hình nền lịch sử hào hùng của dân tộc Việt Nam
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {figures.slice(0, visibleCount).map((figure, index) => (
            <motion.div 
              key={figure.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-2 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative">
                <img 
                  src={figure.imageUrl} 
                  alt={figure.name} 
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="font-['Playfair_Display'] font-bold text-xl text-white">
                      {figure.name}
                    </h3>
                    <p className="text-gray-200 text-sm">{figure.lifespan}</p>
                  </div>
                </div>
                <Link href={`/thoi-ky/${periods.find(p => p.id === figure.periodId)?.slug || 'unknown'}`}>
                  <div className="absolute top-3 right-3 bg-[#4527A0] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-[#311B92] transition-colors">
                    {periods.find(p => p.id === figure.periodId)?.name || ""}
                  </div>
                </Link>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <p className="text-gray-600 line-clamp-3 text-sm mb-4">{figure.description}</p>
                
                {figure.achievements && figure.achievements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm flex items-center text-[#C62828] mb-2">
                      <Award className="h-4 w-4 mr-2" /> 
                      Chiến công tiêu biểu:
                    </h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {figure.achievements.slice(0, 2).map((achievement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 mr-2"></span>
                          <span className="line-clamp-1">{achievement.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-auto pt-3 border-t border-gray-100 mt-4">
                  <Link href={`/nhan-vat/${figure.id}/${slugify(figure.name)}`}>
                    <div className="flex justify-between items-center group cursor-pointer">
                      <span className="text-[#4527A0] font-medium text-sm group-hover:underline">Xem chi tiết</span>
                      <ChevronRight className="h-5 w-5 text-[#4527A0] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={handleViewAllFigures}
            className="bg-[#4527A0] hover:bg-[#311B92] text-white px-8 py-3 rounded-md font-['Montserrat'] text-lg transition-colors shadow-md hover:shadow-lg flex mx-auto items-center gap-2"
          >
            Xem Tất Cả Nhân Vật
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

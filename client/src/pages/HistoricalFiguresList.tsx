import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { HistoricalFigure } from '@/lib/types';
import { ChevronRight, UserIcon, Award, Users, Search, Filter, ArrowDownAZ } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HistoricalFiguresList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  
  const { data: figures, isLoading } = useQuery<HistoricalFigure[]>({
    queryKey: ['/api/historical-figures'],
  });

  const { data: periods } = useQuery<any[]>({
    queryKey: ['/api/periods'],
  });
  
  // Filter and sort figures
  const filteredFigures = figures ? figures.filter(figure => {
    const matchesSearch = searchTerm === '' || 
      figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      figure.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = periodFilter === 'all' || figure.period.includes(periodFilter);
    
    return matchesSearch && matchesPeriod;
  }) : [];
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredFigures.length));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#4527A0] mb-16">
            Đang tải danh sách nhân vật...
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-[#4527A0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6 flex items-center">
        <Link href="/">
          <div className="flex items-center text-gray-600 hover:text-[#4527A0] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Trở về trang chủ</span>
          </div>
        </Link>
      </div>
      <div className="text-center mb-16">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-[#4527A0] inline-flex items-center justify-center gap-3">
          <Users className="h-8 w-8" />
          Nhân Vật <span className="text-[#C62828]">Lịch Sử Việt Nam</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Tìm hiểu về những nhân vật đã đóng góp và định hình nền lịch sử hào hùng của dân tộc Việt Nam
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm kiếm theo tên nhân vật..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="">
                <SelectValue placeholder="Chọn thời kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời kỳ</SelectItem>
                {periods?.map((period: any) => (
                  <SelectItem key={period.id} value={period.name}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-end">
            <div className="text-sm text-gray-500">
              <ArrowDownAZ className="inline-block mr-2" size={18} />
              <span>Đang hiển thị {Math.min(visibleCount, filteredFigures.length)} / {filteredFigures.length} nhân vật</span>
            </div>
          </div>
        </div>
      </div>
      
      {filteredFigures.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy nhân vật nào</h3>
          <p className="mt-2 text-sm text-gray-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả nhân vật.</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setPeriodFilter('all');
            }}
            variant="outline"
            className="mt-4"
          >
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredFigures.slice(0, visibleCount).map((figure, index) => (
            <motion.div 
              key={figure.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-2 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
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
                <div className="absolute top-3 right-3 bg-[#4527A0] text-white px-3 py-1 rounded-full text-xs font-medium">
                  {figure.period}
                </div>
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
      )}
      
      {visibleCount < filteredFigures.length && (
        <div className="text-center mt-12">
          <button 
            onClick={handleLoadMore}
            className="bg-[#4527A0] hover:bg-[#311B92] text-white px-8 py-3 rounded-md font-['Montserrat'] text-lg transition-colors shadow-md hover:shadow-lg flex mx-auto items-center gap-2"
          >
            Xem Thêm Nhân Vật
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

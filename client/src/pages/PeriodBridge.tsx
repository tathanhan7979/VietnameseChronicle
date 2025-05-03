import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PeriodBridge() {
  const { periodSlug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Hiển thị thông báo
    toast({
      title: "Đang chuyển hướng",
      description: `Đang chuyển đến thời kỳ lịch sử...`,
    });
    
    // Chuyển hướng về trang chủ
    setLocation('/');
    
    // Delay cuộn đến id phần tử
    setTimeout(() => {
      const elementId = `period-${periodSlug}`;
      const element = document.getElementById(elementId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast({
          title: "Đã chuyển tới",
          description: `Đã tìm thấy thời kỳ lịch sử`,
          variant: "default"
        });
      } else {
        toast({
          title: "Không tìm thấy",
          description: `Không tìm thấy thời kỳ ${periodSlug}`,
          variant: "destructive"
        });
      }
    }, 1000);
  }, [periodSlug, setLocation, toast]);
  
  return null; // Component này không hiển thị gì cả, chỉ xử lý logic điều hướng
}

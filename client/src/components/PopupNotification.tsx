import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useLocation } from "wouter";

export function PopupNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [duration, setDuration] = useState(24);
  const [location] = useLocation();
  const [animation, setAnimation] = useState(false);
  
  // Kiểm tra xem đang ở trang admin hay không
  const isAdminPage = location.startsWith("/admin");

  useEffect(() => {
    // Nếu đang ở trang admin, không hiển thị popup
    if (isAdminPage) {
      return;
    }

    const fetchPopupSettings = async () => {
      try {
        // Lấy cài đặt popup từ server
        const [enabledResponse, contentResponse, titleResponse, durationResponse] = await Promise.all([
          fetch('/api/settings/popup_enabled'),
          fetch('/api/settings/popup_notification'),
          fetch('/api/settings/popup_title'),
          fetch('/api/settings/popup_duration')
        ]);

        if (enabledResponse.ok && contentResponse.ok && titleResponse.ok && durationResponse.ok) {
          const enabledData = await enabledResponse.json();
          const contentData = await contentResponse.json();
          const titleData = await titleResponse.json();
          const durationData = await durationResponse.json();

          // Chuyển đổi giá trị string "true"/"false" thành boolean
          const isEnabled = enabledData.value === "true";
          
          // Kiểm tra nếu popup được bật và có nội dung
          if (isEnabled && contentData.value) {
            setContent(contentData.value);
            setTitle(titleData.value || "Thông báo");
            
            // Kiểm tra localStorage để xem người dùng đã đóng popup này chưa
            const lastDismissed = localStorage.getItem('popup_dismissed_at');
            const popupDuration = parseInt(durationData.value || "24", 10); // Mặc định 24 giờ
            setDuration(popupDuration);
            
            if (lastDismissed) {
              const dismissedTime = new Date(lastDismissed).getTime();
              const currentTime = new Date().getTime();
              const hoursDiff = (currentTime - dismissedTime) / (1000 * 60 * 60);
              
              // Nếu thời gian từ lần đóng cuối cùng ít hơn thời gian cài đặt, không hiển thị
              if (hoursDiff < popupDuration) {
                return;
              }
            }
            
            // Hiển thị popup sau 1 giây để trang đã tải xong
            setTimeout(() => {
              setShowPopup(true);
              // Thêm animation sau 50ms để có hiệu ứng xuất hiện mượt mà
              setTimeout(() => {
                setIsOpen(true);
                setTimeout(() => {
                  setAnimation(true);
                }, 100);
              }, 50);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error fetching popup settings:', error);
      }
    };

    fetchPopupSettings();
  }, [isAdminPage]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Ẩn popup sau khi animation kết thúc
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };
  
  const handleDontShowAgain = () => {
    setIsOpen(false);
    
    // Lưu thời gian đóng popup vào localStorage
    localStorage.setItem('popup_dismissed_at', new Date().toISOString());
    
    // Ẩn popup sau khi animation kết thúc
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className="fixed inset-0 bg-black/70" onClick={handleClose} />
      <Card 
        className={`w-full max-w-md max-h-[80vh] overflow-y-auto relative 
          shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          border-2 border-primary/30 
          ${animation ? 'animate-bounce-subtle' : 'translate-y-0'}
          transition-transform duration-300 ease-out
        `}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div className="absolute top-2 right-2 z-10">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="pt-6 pb-2">
          {title && (
            <h3 className="text-xl font-semibold text-center mb-4 text-primary drop-shadow-sm">{title}</h3>
          )}
          <div 
            className="prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </CardContent>
        <CardFooter className="flex justify-between pt-4 pb-3 gap-4 border-t border-primary/10 mt-2">
          <Button 
            variant="outline" 
            onClick={handleDontShowAgain}
            className="text-sm px-3 hover:bg-primary/10 hover:text-primary"
          >
            Không hiển thị lại ({duration}h)
          </Button>
          <Button 
            variant="default" 
            onClick={handleClose}
            className="bg-primary hover:bg-primary/90"
          >
            Đóng
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PopupNotification;
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PopupNotificationProps {}

export default function PopupNotification({}: PopupNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  // Kiểm tra xem đang ở trang admin hay không
  const isAdminPage = location.includes('/admin');

  const { data: popupEnabled } = useQuery({
    queryKey: ["/api/settings/popup_enabled"],
    refetchOnWindowFocus: false,
  });

  const { data: popupTitle } = useQuery({
    queryKey: ["/api/settings/popup_title"],
    refetchOnWindowFocus: false,
  });

  const { data: popupContent } = useQuery({
    queryKey: ["/api/settings/popup_notification"],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Nếu đang ở trang admin thì không hiển thị popup
    if (isAdminPage) {
      return;
    }
    
    // Kiểm tra xem đã ẩn popup trong 24h chưa
    const hiddenUntil = localStorage.getItem("popupHiddenUntil");
    const currentTime = new Date().getTime();

    if (
      popupEnabled?.value === "true" &&
      popupContent?.value &&
      (!hiddenUntil || currentTime > parseInt(hiddenUntil))
    ) {
      setIsOpen(true);
    }
  }, [popupEnabled, popupContent, isAdminPage, location]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHide24h = () => {
    // Lưu thời gian hiện tại + 24h vào localStorage
    const hiddenUntil = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem("popupHiddenUntil", hiddenUntil.toString());
    setIsOpen(false);
  };

  // Không hiển thị popup nếu:
  // 1. Đang ở trang admin
  // 2. Popup bị tắt hoặc không có nội dung
  if (
    isAdminPage ||
    !popupEnabled?.value ||
    popupEnabled?.value !== "true" ||
    !popupContent?.value
  ) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {popupTitle?.value || "Thông báo"}
          </DialogTitle>
        </DialogHeader>
        <div
          className="popup-content py-4"
          dangerouslySetInnerHTML={{ __html: popupContent?.value || "" }}
        />
        <DialogFooter className="flex sm:justify-between justify-center flex-wrap gap-2">
          <Button variant="outline" onClick={handleHide24h}>
            Ẩn trong 24 giờ
          </Button>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

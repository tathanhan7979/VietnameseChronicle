import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function App() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    toast({
      title: "Ứng dụng đã khởi động",
      description: "Trang quản lý người đóng góp độc lập"
    });
  }, []);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Hoàn tất",
        description: "Đã cập nhật dữ liệu"
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Quản lý người đóng góp</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Ứng dụng độc lập</h2>
          <p className="mb-4 text-gray-600">
            Đây là ứng dụng quản lý người đóng góp độc lập, không phụ thuộc vào các module khác của hệ thống chính.
          </p>
          
          <Button onClick={handleClick} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Làm mới dữ liệu"}
          </Button>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
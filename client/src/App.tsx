import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import ThemeProvider from "@/lib/theme-provider";

// Thông báo bảo trì
function MaintenancePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Trang đang bảo trì</h1>
        <p className="text-gray-600 text-center mb-6">
          Chúng tôi đang cập nhật hệ thống để cải thiện trải nghiệm của bạn. 
          Xin vui lòng quay lại sau.
        </p>
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 text-center">
            Cảm ơn bạn đã kiên nhẫn chờ đợi!
          </p>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Trang chủ */}
      <Route path="/" component={Home} />
      
      {/* Trang login Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Tất cả các trang admin khác tạm thời chuyển đến trang bảo trì */}
      <Route path="/admin/:path*" component={MaintenancePage} />
      
      {/* Tất cả các trang khác tạm thời chuyển đến trang bảo trì */}
      <Route path="/:path+" component={MaintenancePage} />
      
      {/* Trang 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
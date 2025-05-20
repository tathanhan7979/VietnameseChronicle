import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import BackToTop from "@/components/BackToTop";
import PopupNotification from "@/components/PopupNotification";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import HistoricalFigureDetail from "@/pages/HistoricalFigureDetail";
import HistoricalFiguresList from "@/pages/HistoricalFiguresList";
import HistoricalSiteDetail from "@/pages/HistoricalSiteDetail";
import HistoricalSitesList from "@/pages/HistoricalSitesList";
import PeriodDetail from "@/pages/PeriodDetail";
import SearchResults from "@/pages/SearchResults";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Contributors from "@/pages/Contributors";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import PeriodsAdmin from "@/pages/admin/periods";
import EventTypesAdmin from "@/pages/admin/event-types";
import EventsAdmin from "@/pages/admin/events";
import HistoricalFiguresAdmin from "@/pages/admin/historical-figures";
import HistoricalSitesAdmin from "@/pages/admin/historical-sites";
import FeedbackAdmin from "@/pages/admin/feedback";
import SettingsAdmin from "@/pages/admin/settings";
import UsersAdmin from "@/pages/admin/users";
import NewsAdmin from "@/pages/admin/news";
import ContributorsAdmin from "@/pages/admin/contributors-simple";
import NewsListPage from "@/pages/news-list";
import NewsDetailPage from "@/pages/news-detail";
import ImageOptimizer from "@/pages/admin/image-optimizer";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/thoi-ky/:periodSlug" component={PeriodDetail} />
      <Route path="/su-kien/:eventId" component={EventDetail} />
      <Route path="/su-kien/:eventId/:eventSlug" component={EventDetail} />
      <Route path="/nhan-vat" component={HistoricalFiguresList} />
      <Route path="/nhan-vat/:figureId" component={HistoricalFigureDetail} />
      <Route path="/nhan-vat/:figureId/:figureSlug" component={HistoricalFigureDetail} />
      <Route path="/di-tich" component={HistoricalSitesList} />
      <Route path="/di-tich/:id" component={HistoricalSiteDetail} />
      <Route path="/di-tich/:id/:slug" component={HistoricalSiteDetail} />
      <Route path="/tin-tuc" component={NewsListPage} />
      <Route path="/tin-tuc/:id" component={NewsDetailPage} />
      <Route path="/tin-tuc/:id/:slug" component={NewsDetailPage} />
      <Route path="/tim-kiem" component={SearchResults} />
      <Route path="/chinh-sach-bao-mat" component={PrivacyPolicy} />
      <Route path="/dieu-khoan-su-dung" component={TermsOfService} />
      <Route path="/nguoi-dong-gop" component={Contributors} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      {/* Trang tổng quan - tất cả người dùng đã đăng nhập đều có thể truy cập */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      
      {/* Quản lý thời kỳ - cần quyền "can_manage_periods" */}
      <ProtectedRoute path="/admin/periods" 
        component={PeriodsAdmin} 
        requirePermission="periods" />
      
      {/* Quản lý loại sự kiện - cần quyền "can_manage_events" */}
      <ProtectedRoute path="/admin/event-types" 
        component={EventTypesAdmin} 
        requirePermission="events" />
      
      {/* Quản lý sự kiện - cần quyền "can_manage_events" */}
      <ProtectedRoute path="/admin/events" 
        component={EventsAdmin} 
        requirePermission="events" />
      
      {/* Quản lý nhân vật lịch sử - cần quyền "can_manage_figures" */}
      <ProtectedRoute path="/admin/historical-figures" 
        component={HistoricalFiguresAdmin} 
        requirePermission="figures" />
      
      {/* Quản lý địa danh lịch sử - cần quyền "can_manage_sites" */}
      <ProtectedRoute path="/admin/historical-sites" 
        component={HistoricalSitesAdmin} 
        requirePermission="sites" />
      
      {/* Quản lý phản hồi - chỉ dành cho admin */}
      <ProtectedRoute path="/admin/feedback" 
        component={FeedbackAdmin} 
        adminOnly={true} />
      
      {/* Quản lý người dùng - chỉ dành cho admin */}
      <ProtectedRoute path="/admin/users" 
        component={UsersAdmin} 
        adminOnly={true} />
      
      {/* Thiết lập hệ thống - chỉ dành cho admin */}
      <ProtectedRoute path="/admin/settings" 
        component={SettingsAdmin} 
        adminOnly={true} />
        
      {/* Quản lý tin tức - cần quyền "can_manage_news" */}
      <ProtectedRoute path="/admin/news" 
        component={NewsAdmin} 
        requirePermission="news" />
        
      {/* Quản lý người đóng góp - chỉ dành cho admin */}
      <ProtectedRoute path="/admin/contributors" 
        component={ContributorsAdmin} 
        adminOnly={true} />
        
      {/* Công cụ tối ưu hóa ảnh - chỉ dành cho admin */}
      <ProtectedRoute path="/admin/image-optimizer" 
        component={ImageOptimizer} 
        adminOnly={true} />
      
      {/* Catch all route for 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);

  // Load favicon
  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const response = await fetch('/api/settings/site_favicon');
        if (response.ok) {
          const data = await response.json();
          if (data && data.value) {
            setFavicon(data.value);
          }
        }
      } catch (error) {
        console.error('Error fetching favicon:', error);
      }
    };
    
    fetchFavicon();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Serif:wght@400;700&family=Montserrat:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load Material Icons
    const iconsLink = document.createElement('link');
    iconsLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    iconsLink.rel = "stylesheet";
    document.head.appendChild(iconsLink);

    // Set title
    document.title = "Lịch Sử Việt Nam | Từ Thời Vua Hùng Đến Hiện Đại";
  }, []);

  // Update favicon when it changes
  useEffect(() => {
    // Remove existing favicon if any
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }

    // Remove existing apple-touch-icon if any
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (existingAppleIcon) {
      document.head.removeChild(existingAppleIcon);
    }

    // Create new favicon link
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    
    // Use custom favicon if available, otherwise use default
    if (favicon && favicon.trim() !== '') {
      faviconLink.href = favicon;
      faviconLink.type = favicon.startsWith('data:image') ? 'image/png' : 'image/x-icon';
    } else {
      // Fallback to default favicon (using generated-icon.png in root directory)
      faviconLink.href = '/generated-icon.png';
      faviconLink.type = 'image/png';
    }
    
    document.head.appendChild(faviconLink);
    
    // Thêm apple-touch-icon cho thiết bị iOS
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = favicon && favicon.trim() !== '' ? favicon : '/generated-icon.png';
    document.head.appendChild(appleTouchIcon);
  }, [favicon]);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <BackToTop />
        <PopupNotification />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

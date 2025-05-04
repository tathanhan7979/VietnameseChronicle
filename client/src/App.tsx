import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import BackToTop from "@/components/BackToTop";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import HistoricalFigureDetail from "@/pages/HistoricalFigureDetail";
import HistoricalFiguresList from "@/pages/HistoricalFiguresList";
import HistoricalSiteDetail from "@/pages/HistoricalSiteDetail";
import HistoricalSitesList from "@/pages/HistoricalSitesList";
import PeriodDetail from "@/pages/PeriodDetail";
import SearchResults from "@/pages/SearchResults";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
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
      <Route path="/tim-kiem" component={SearchResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMounted, setIsMounted] = useState(false);

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

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <BackToTop />
    </QueryClientProvider>
  );
}

export default App;

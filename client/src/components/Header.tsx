import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Clock, User, Landmark, Home, Search, Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onOpenSearch: () => void;
  activeSection?: string;
  onSectionSelect?: (sectionId: string) => void;
}

export default function Header({
  onOpenSearch,
  activeSection = "",
  onSectionSelect,
}: HeaderProps) {
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: "timeline", name: "Dòng Thời Gian", icon: Clock, href: "/#timeline" },
    {
      id: "historical-figures",
      name: "Nhân Vật",
      icon: User,
      href: "/#historical-figures",
    },
    {
      id: "historical-sites",
      name: "Di Tích",
      icon: Landmark,
      href: "/#historical-sites",
    },
    {
      id: "news",
      name: "Tin Tức",
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      href: "/tin-tuc",
    },
    {
      id: "contributors",
      name: "Người đóng góp",
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: "/nguoi-dong-gop",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation click
  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    // Only handle for homepage sections
    if (onSectionSelect) {
      e.preventDefault();
      onSectionSelect(sectionId);
    }

    // Close mobile menu when clicking a navigation item
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-md ${isScrolled ? "bg-black/80 shadow-lg" : "bg-black/50"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer group">
              <div className="h-10 w-10 mr-3 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold font-['Playfair_Display'] text-lg transition-transform duration-300 group-hover:scale-105 shadow-md">
                <img src="/uploads/start.png" alt="Start" className="p-2" />
              </div>
              <h1 className="font-['Playfair_Display'] font-bold text-xl md:text-2xl text-white tracking-wider">
                LỊCH SỬ <span className="text-red-500">VIỆT NAM</span>
              </h1>
            </div>
          </Link>

          {/* Mobile Menu Icon */}
          {isMobile && (
            <div className="flex items-center">
              <button
                onClick={onOpenSearch}
                className="p-2 mr-2 text-white/80 hover:text-white transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all hover:bg-white/10 ${activeSection === item.id ? "text-red-400 bg-white/10" : "text-white/90 hover:text-white"}`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={onOpenSearch}
                className="flex items-center ml-2 px-4 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Tìm kiếm"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm Kiếm
              </button>
            </nav>
          )}
        </div>

        {/* Mobile Menu Dropdown - slide down animation */}
        {isMobile && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
          >
            <nav className="py-4 border-t border-white/20">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(item.id, e)}
                      className={`flex items-center py-3 px-4 rounded-md font-medium transition-colors hover:bg-white/10 ${activeSection === item.id ? "text-red-400 bg-white/10" : "text-white/90 hover:text-white"}`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={onOpenSearch}
                    className="w-full flex items-center py-3 px-4 rounded-md font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    Tìm Kiếm
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

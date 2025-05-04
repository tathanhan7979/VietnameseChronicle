import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  BarChart3,
  Clock,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logoutMutation.mutate();
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/periods', label: 'Thời kỳ lịch sử', icon: <Clock size={20} /> },
    { path: '/admin/event-types', label: 'Loại sự kiện', icon: <FileText size={20} /> },
    { path: '/admin/events', label: 'Sự kiện lịch sử', icon: <BarChart3 size={20} /> },
    { path: '/admin/historical-figures', label: 'Nhân vật lịch sử', icon: <User size={20} /> },
    { path: '/admin/historical-sites', label: 'Địa danh lịch sử', icon: <Home size={20} /> },
    { path: '/admin/feedback', label: 'Phản hồi', icon: <MessageSquare size={20} /> },
    { path: '/admin/settings', label: 'Thiết lập', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <div className="flex items-center">
              <span className="text-lg font-semibold">Admin Lịch sử VN</span>
            </div>
            <button 
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}
                className={`
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-md 
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center lg:hidden">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                <div className="flex items-center">
                  <Link href="/"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem website
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  requirePermission = null,
}: {
  path: string;
  component: () => React.JSX.Element;
  adminOnly?: boolean;
  requirePermission?: 'periods' | 'events' | 'figures' | 'sites' | 'news' | null;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  // Kiểm tra quyền truy cập
  let accessDenied = false;
  let deniedMessage = '';

  // Kiểm tra quyền admin
  if (adminOnly && !user.isAdmin) {
    accessDenied = true;
    deniedMessage = 'Đến phần này yêu cầu quyền quản trị viên.';
  }

  // Kiểm tra quyền truy cập dựa trên loại nội dung
  if (requirePermission) {
    switch(requirePermission) {
      case 'periods':
        if (!user.isAdmin && !user.can_manage_periods) {
          accessDenied = true;
          deniedMessage = 'Bạn không có quyền quản lý thời kỳ lịch sử.';
        }
        break;
      case 'events':
        if (!user.isAdmin && !user.can_manage_events) {
          accessDenied = true;
          deniedMessage = 'Bạn không có quyền quản lý sự kiện lịch sử.';
        }
        break;
      case 'figures':
        if (!user.isAdmin && !user.can_manage_figures) {
          accessDenied = true;
          deniedMessage = 'Bạn không có quyền quản lý nhân vật lịch sử.';
        }
        break;
      case 'sites':
        if (!user.isAdmin && !user.can_manage_sites) {
          accessDenied = true;
          deniedMessage = 'Bạn không có quyền quản lý địa danh lịch sử.';
        }
        break;
      case 'news':
        if (!user.isAdmin && !user.can_manage_news) {
          accessDenied = true;
          deniedMessage = 'Bạn không có quyền quản lý tin tức.';
        }
        break;
    }
  }

  // Nếu không có quyền truy cập, hiển thị thông báo lỗi
  if (accessDenied) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Quyền truy cập bị từ chối</h1>
          <p>{deniedMessage}</p>
          <p className="mt-4">Vui lòng liên hệ quản trị viên nếu bạn cần truy cập vào nội dung này.</p>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

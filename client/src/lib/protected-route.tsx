import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export type PermissionType = 
  | 'admin' 
  | 'periods' 
  | 'events' 
  | 'figures' 
  | 'sites'
  | 'any';

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  requiredPermission = 'any',
}: {
  path: string;
  component: () => React.JSX.Element;
  adminOnly?: boolean;
  requiredPermission?: PermissionType;
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

  // Nếu user là admin, luôn cho phép truy cập
  if (user.isAdmin) {
    return (
      <Route path={path}>
        <Component />
      </Route>
    );
  }

  // Nếu yêu cầu quyền admin nhưng người dùng không phải admin
  if (adminOnly) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Đến phần này yêu cầu quyền admin</h1>
          <p>Bạn không có quyền truy cập vào trang này.</p>
        </div>
      </Route>
    );
  }

  // Kiểm tra quyền truy cập cụ thể
  let hasPermission = requiredPermission === 'any';
  
  if (requiredPermission === 'periods' && user.canManagePeriods) {
    hasPermission = true;
  } else if (requiredPermission === 'events' && user.canManageEvents) {
    hasPermission = true;
  } else if (requiredPermission === 'figures' && user.canManageFigures) {
    hasPermission = true;
  } else if (requiredPermission === 'sites' && user.canManageSites) {
    hasPermission = true;
  }

  if (!hasPermission) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
          <p>Bạn không có quyền truy cập vào phần này.</p>
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

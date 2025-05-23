import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any; // UseMutationResult cho login
  logoutMutation: any; // UseMutationResult cho logout
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Lấy thông tin người dùng đã đăng nhập
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false
  });

  // Đăng nhập
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || "Đăng nhập thất bại");
        }
        return data;
      } catch (error: any) {
        // Xử lý lỗi từ response để không hiển thị JSON
        if (error.message.includes('401')) {
          throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }
        throw new Error(error.message || "Đăng nhập thất bại");
      }
    },
    onSuccess: (data) => {
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        // Cập nhật thông tin người dùng và đặt trực tiếp vào queryClient
        if (data.user) {
          queryClient.setQueryData(["/api/auth/user"], data.user);
          console.log("Token saved:", data.token);
          console.log("User data cached:", data.user);
        }
        
        // Đồng thời refetch để đảm bảo
        refetch();
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn trở lại",
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Đăng xuất
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Xóa token trong localStorage
      localStorage.removeItem("authToken");
      // Đặt lại trạng thái người dùng
      queryClient.setQueryData(["/api/auth/user"], null);
    },
    onSuccess: () => {
      toast({
        title: "Đăng xuất thành công",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Tự động khôi phục phiên đăng nhập khi có token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("Found existing token, attempting to restore session");
      
      // Thêm token vào header Authorization cho tất cả các request API
      const authHeader = `Bearer ${token}`;
      document.cookie = `authToken=${token}; path=/; max-age=86400`;
      
      refetch();
    }
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

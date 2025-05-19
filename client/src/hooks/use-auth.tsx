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
  registerMutation: any; // UseMutationResult cho register
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  email: string;
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
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false
  });

  // Đăng nhập
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
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
      // Đã đăng nhập thành công
      // Cập nhật thông tin người dùng và đặt trực tiếp vào queryClient
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      
      // Đồng thời refetch để đảm bảo
      refetch();
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại",
        variant: "default",
      });
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
      // Gọi API đăng xuất
      await apiRequest("POST", "/api/logout");
      // Đặt lại trạng thái người dùng
      queryClient.setQueryData(["/api/user"], null);
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
      refetch();
    }
  }, [refetch]);

  // Đăng ký
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", userData);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || "Đăng ký thất bại");
        }
        return data;
      } catch (error: any) {
        if (error.message.includes('400')) {
          throw new Error('Tên đăng nhập đã tồn tại');
        }
        throw new Error(error.message || "Đăng ký thất bại");
      }
    },
    onSuccess: (data) => {
      // Cập nhật thông tin người dùng
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      
      // Refetch để đảm bảo
      refetch();
      
      toast({
        title: "Đăng ký thành công",
        description: "Chào mừng bạn tham gia",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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

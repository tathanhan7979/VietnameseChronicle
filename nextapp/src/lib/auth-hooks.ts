import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { useToast } from './toast';

// Tạm thời tạo queryClient 
import { QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient();

// Tạm thời tạo apiRequest
async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Request failed with status ${response.status}`
    );
  }

  return response;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const { toast } = useToast();
  
  // Truy vấn thông tin người dùng
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: Infinity, 
    // Không hiển thị toast khi chưa đăng nhập (TanStack Query v5 có thay đổi)
    // onError không còn là thuộc tính của config, thay vào đó là phương thức của kết quả
  });

  // Mutation đăng nhập
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(['/api/auth/user'], data);
      toast({
        title: "Đăng nhập thành công",
        description: `Xin chào, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        variant: "destructive",
      });
    },
  });

  // Mutation đăng xuất
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn sau!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message || "Đã xảy ra lỗi khi đăng xuất",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    isLoggedIn: !!user,
  };
}
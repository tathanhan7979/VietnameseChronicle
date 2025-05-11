import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiRequest, queryClient, getQueryFn } from '@/utils/queryClient';

type LoginCredentials = {
  username: string;
  password: string;
};

export function useAuth() {
  // Truy vấn thông tin người dùng
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
  });

  // Mutation đăng nhập
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Đăng nhập thất bại');
      }
      return res.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(['/api/auth/user'], data);
    },
  });

  // Mutation đăng xuất
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    loginMutation,
    logoutMutation,
  };
}

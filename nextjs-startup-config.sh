#!/bin/bash

# Tạo thư mục cần thiết cho Next.js
echo "Tạo các thư mục cần thiết cho Next.js"
mkdir -p nextapp/src/utils
mkdir -p nextapp/src/components
mkdir -p nextapp/src/hooks
mkdir -p nextapp/public/uploads

# Tạo file queryClient.ts
echo "Tạo file queryClient.ts"
cat > nextapp/src/utils/queryClient.ts << 'EOF'
import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = `HTTP error: ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (e) {
      // Không làm gì nếu không thể đọc JSON
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options: RequestInit = {}
) {
  const isFormData = data instanceof FormData;
  const defaultHeaders: HeadersInit = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  const fetchOptions: RequestInit = {
    method,
    credentials: 'include', // Gửi kèm cookie
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (data && !isFormData) {
    fetchOptions.body = JSON.stringify(data);
  } else if (isFormData) {
    fetchOptions.body = data as FormData;
  }

  const res = await fetch(url, fetchOptions);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const endpoint = queryKey[0] as string;
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (res.status === 401 && on401 === "returnNull") {
      return null;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: false,
    },
  },
});
EOF

# Tạo file useAuth.ts
echo "Tạo file useAuth.ts"
cat > nextapp/src/hooks/useAuth.ts << 'EOF'
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
EOF

echo "Cấu hình Next.js hoàn tất."
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Log chi tiết request
    console.log(`API Request: ${method} ${url}`);
    if (data) {
      console.log('Request body:', data);
      console.log('Request body (JSON):', JSON.stringify(data));
    }
    
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // Log response status
    console.log(`API Response: ${res.status} ${res.statusText}`);
    
    // Nếu lỗi, log chi tiết hơn
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      try {
        // Clone response để có thể đọc nội dung mà không làm mất response gốc
        const errorText = await res.clone().text();
        console.error('Error response text:', errorText);
        
        try {
          // Thử parse thành JSON nếu có thể
          const errorJson = JSON.parse(errorText);
          console.error('Error response JSON:', errorJson);
        } catch (e) {
          // Không phải JSON, đã log text ở trên
        }
      } catch (e) {
        console.error('Could not read error response');
      }
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Nếu có nhiều hơn 1 phần tử trong queryKey,
    // xử lý chúng như các tham số truy vấn
    if (queryKey.length > 1) {
      const params = new URLSearchParams();
      
      // Thêm các tham số từ queryKey[1] trở đi
      for (let i = 1; i < queryKey.length; i++) {
        const param = queryKey[i];
        // Chỉ thêm các giá trị khác null và undefined
        if (param !== null && param !== undefined && param !== '') {
          // Nếu là chuỗi, phải có nội dung
          if (typeof param === 'string') {
            // Sử dụng tên tham số phù hợp
            if (i === 1) params.append('term', param);
            if (i === 2) params.append('period', param);
            if (i === 3) params.append('eventType', param);
          }
        }
      }
      
      // Nếu có tham số, thêm vào URL
      const queryString = params.toString();
      if (queryString) {
        const finalUrl = `${url}?${queryString}`;
        console.log('Search URL:', finalUrl);

        // Lấy token từ localStorage nếu có
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = token 
          ? { "Authorization": `Bearer ${token}` } 
          : {};

        const res = await fetch(finalUrl, {
          credentials: "include",
          headers
        });
        
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }
        
        await throwIfResNotOk(res);
        return await res.json();
      }
    }
    
    // Nếu không có tham số hoặc tất cả tham số đều rỗng
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = token 
      ? { "Authorization": `Bearer ${token}` } 
      : {};

    const res = await fetch(url, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

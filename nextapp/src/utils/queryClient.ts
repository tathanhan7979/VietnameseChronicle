import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
});

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await res.json();
      throw new Error(error.message || error.error || 'Có lỗi xảy ra');
    } else {
      const error = await res.text();
      throw new Error(error || res.statusText || 'Có lỗi xảy ra');
    }
  }
  return res;
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any,
  customOptions?: RequestInit
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...customOptions,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(path, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => async ({ queryKey }: { queryKey: string[] }) => {
  const [url] = queryKey;
  const res = await fetch(url);
  
  if (res.status === 401 && options.on401 === "returnNull") {
    return null;
  }
  
  await throwIfResNotOk(res);
  
  const data = await res.json();
  return data as T;
};
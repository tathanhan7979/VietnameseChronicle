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

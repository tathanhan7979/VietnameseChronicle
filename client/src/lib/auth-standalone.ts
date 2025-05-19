// Hàm đơn giản để lưu và lấy token xác thực từ localStorage
export const auth = {
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('authToken');
  },
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};

// Hàm gọi API với xác thực
export const apiRequest = async (
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    // Trả về lỗi với thông tin chi tiết từ server nếu có
    const errorText = await response.text();
    let errorData;
    
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      errorData = { message: errorText };
    }
    
    throw new Error(errorData.message || `Lỗi yêu cầu: ${response.status}`);
  }
  
  // Kiểm tra nếu response có nội dung và content-type là application/json
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Hàm đăng nhập đơn giản
export const login = async (username: string, password: string): Promise<{ user: any, token: string }> => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }
    
    const data = await response.json();
    
    // Lưu token vào localStorage
    auth.setToken(data.token);
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Đăng nhập thất bại');
  }
};

// Hàm đăng xuất
export const logout = () => {
  auth.removeToken();
  window.location.href = '/login';
};
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import ContributorsStandalone from "./pages/admin/contributors-standalone";
import LoginStandalone from "./pages/login-standalone";
import { auth } from "./lib/auth-standalone";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra xác thực khi component được mount
  useEffect(() => {
    const checkAuth = () => {
      const token = auth.getToken();
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    auth.removeToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated ? (
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-sm p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Quản lý người đóng góp</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Đăng xuất
              </button>
            </div>
          </header>
          
          <main className="flex-grow container mx-auto py-6 px-4">
            <ContributorsStandalone />
          </main>
          
          <footer className="bg-white border-t p-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Quản lý Người đóng góp - Ứng dụng độc lập</p>
          </footer>
        </div>
      ) : (
        <LoginStandalone onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

// Render ứng dụng
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
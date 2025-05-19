import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Quản lý người đóng góp</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Ứng dụng độc lập</h2>
          <p className="mb-4 text-gray-600">
            Đây là ứng dụng quản lý người đóng góp độc lập, không phụ thuộc vào các module khác của hệ thống chính.
          </p>
          
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => alert("Đã cập nhật dữ liệu")}
          >
            Làm mới dữ liệu
          </button>
        </div>
      </main>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
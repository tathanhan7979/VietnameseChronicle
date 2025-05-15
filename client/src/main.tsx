import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/timeline.css";
import { prepareDocumentForSnapRender, preventPreRenderErrors, setupSnapSaveState } from "./react-snap-init";

// Ngăn chặn lỗi prerender
preventPreRenderErrors();

// Hỗ trợ React-Snap với cú pháp đúng
const rootElement = document.getElementById("root");

// Chuẩn bị document cho việc render của React-Snap
prepareDocumentForSnapRender();

if (rootElement) {
  if (rootElement.hasChildNodes()) {
    // Nếu đã có nội dung (prerendered bởi react-snap), sử dụng hydrate
    hydrateRoot(rootElement, <App />);
  } else {
    // Nếu chưa có nội dung, sử dụng createRoot
    createRoot(rootElement).render(<App />);
  }
}

// Thiết lập snap save state
setupSnapSaveState();

// Thêm hỗ trợ sự kiện load cho React-Snap
const onLoad = () => {
  if (typeof window !== 'undefined' && window.document) {
    // Đánh dấu document đã tải xong
    document.documentElement.classList.add('loaded');
  }
};

// Đăng ký sự kiện load
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
  }
}

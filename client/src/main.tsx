import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/timeline.css";

// Hỗ trợ React-Snap với cú pháp đúng
const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.hasChildNodes()) {
    // Nếu đã có nội dung (prerendered bởi react-snap), sử dụng hydrate
    hydrateRoot(rootElement, <App />);
  } else {
    // Nếu chưa có nội dung, sử dụng createRoot
    createRoot(rootElement).render(<App />);
  }
}

// Thêm event window.snapSaveState cho React-Snap
if (typeof window !== 'undefined' && 'snapSaveState' in window) {
  // @ts-ignore - Không có định nghĩa TypeScript cho snapSaveState
  window.snapSaveState = () => {
    const state = { ...window.__INITIAL_DATA__ };
    return { 
      __INITIAL_DATA__: state 
    };
  };
}

import { createRoot } from "react-dom/client";
import ContributorsStandalone from "@/pages/admin/contributors-standalone";

// Import minimal dependencies for styling
import "./index.css";

// Create standalone app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<ContributorsStandalone />);
}
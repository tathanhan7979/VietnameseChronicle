// Các định nghĩa kiểu toàn cục cho TypeScript

// Bổ sung định nghĩa cho window chứa __INITIAL_DATA__
interface Window {
  __INITIAL_DATA__?: Record<string, any>;
  snapSaveState?: () => Record<string, any>;
}

// Định nghĩa cho React-Snap
declare module 'react-snap' {
  export function render(options: any): Promise<void>;
}
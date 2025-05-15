interface Window {
  // Các thêm định nghĩa cho Facebook SDK
  FB?: {
    init: (params?: any) => void;
    XFBML: {
      parse: (parent?: Element) => void;
    };
  };
  
  // Thêm định nghĩa cho react-snap
  snapSaveState?: () => any;
  
  // Thêm định nghĩa cho dữ liệu khởi tạo
  __INITIAL_DATA__?: any;
}
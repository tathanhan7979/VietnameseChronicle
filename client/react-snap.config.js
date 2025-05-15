module.exports = {
  // Địa chỉ và cổng ứng dụng khi chạy
  puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  
  // Các đường dẫn cố định cần tạo HTML tĩnh
  include: [
    '/',                     // Trang chủ
    '/tim-kiem',             // Trang tìm kiếm
    '/dieu-khoan-su-dung',   // Điều khoản sử dụng
    '/chinh-sach-bao-mat',   // Chính sách bảo mật
    '/404'                   // Trang 404
  ],
  
  // Cấu hình khác
  skipThirdPartyRequests: true,  // Bỏ qua yêu cầu bên thứ ba (giúp tăng tốc quá trình)
  source: 'dist',                // Thư mục chứa các file build
  destination: 'dist',           // Thư mục đích
  minifyHtml: {                  // Cấu hình nén HTML
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
    sortClassName: true
  },
  
  // Cấu hình timeout và retries
  puppeteerExecutablePath: undefined,    // Để tự động tìm đường dẫn
  puppeteerLaunchOptions: undefined,     // Tự động thiết lập
  puppeteerHeadless: true,               // Chạy ẩn Puppeteer
  puppeteerIgnoreHTTPSErrors: true,      // Bỏ qua lỗi HTTPS
  preconnectThirdParty: false,           // Tắt preconnect cho các bên thứ ba
  inlineCss: false,                      // Không inline CSS
  waitFor: false,                        // Không đợi thêm sau khi load
  
  // Xử lý lỗi
  fixInsertRule: true,                   // Sửa lỗi insertRule
  fixWebpackChunksIssue: true,           // Sửa lỗi webpack chunks
  skipSecurityChecks: true,              // Bỏ qua một số kiểm tra bảo mật (chỉ dùng khi build)
  
  // Tuỳ chọn để cải thiện hiệu suất với nhiều trang
  concurrency: 4                         // Số luồng xử lý đồng thời
};
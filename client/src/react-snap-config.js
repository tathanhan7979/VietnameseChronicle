// Cấu hình cho React-Snap
module.exports = {
  // Địa chỉ URL khi pre-rendering
  source: 'build',
  // Thư mục đích cần lưu file HTML đã render
  destination: 'build',
  // Danh sách các route cần pre-render
  include: [
    '/',
    '/dieu-khoan-su-dung',
    '/chinh-sach-bao-mat',
    '/tim-kiem'
  ],
  // Cấu hình cho Puppeteer
  puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  // Bỏ qua các yêu cầu bên thứ ba để tăng tốc quá trình render
  skipThirdPartyRequests: true,
  // Cấu hình viewport cho Puppeteer
  viewport: {
    width: 1200,
    height: 800
  },
  // Cấu hình UserAgent
  userAgent: 'ReactSnap',
  // Không theo liên kết sâu quá 1 cấp
  crawl: true,
  // Cổng của server
  port: 5000,
  // Tối ưu HTML
  minifyHtml: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
    sortClassName: true
  },
  // Không tải tài nguyên từ các nguồn bên ngoài
  preconnectThirdParty: false,
  // Thời gian chờ lâu nhất cho mỗi trang
  puppeteerTimeout: 30000,
  // Không inline CSS
  inlineCss: false,
  // Xoá tệp blob
  removeBlobs: true,
  // Chạy trong chế độ không đồng bộ
  concurrency: 4,
  // Không cache yêu cầu AJAX
  cacheAjaxRequests: false,
  // Xác thực nguồn
  source: "http://localhost:5000"
};
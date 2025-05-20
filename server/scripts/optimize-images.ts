import path from 'path';
import { optimizeDirectory } from '../utils/image-optimizer';

/**
 * Script tối ưu hóa tất cả ảnh trong thư mục uploads
 * Sử dụng: ts-node server/scripts/optimize-images.ts
 */
async function main() {
  // Thư mục gốc chứa ảnh
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  console.log('====== BẮT ĐẦU TỐI ƯU HÓA HÌNH ẢNH ======');
  console.log('Thư mục gốc:', uploadsDir);
  console.log('==========================================');
  
  // Danh sách các thư mục con cần tối ưu
  const subDirectories = [
    'events',     // Ảnh sự kiện
    'figures',    // Ảnh nhân vật lịch sử 
    'sites',      // Ảnh địa điểm lịch sử
    'backgrounds', // Ảnh nền
    'news',       // Ảnh tin tức
    'contributors', // Ảnh người đóng góp
    'images'      // Ảnh khác
  ];
  
  let totalProcessed = 0;
  let totalFailed = 0;
  let totalSavedSpace = 0;
  
  // Lặp qua từng thư mục con và tối ưu
  for (const dir of subDirectories) {
    const dirPath = path.join(uploadsDir, dir);
    console.log(`\n🔍 Đang tối ưu hóa thư mục: ${dir}`);
    
    // Tối ưu hình ảnh trong thư mục
    const result = await optimizeDirectory(dirPath, {
      format: 'webp', // Chuyển đổi sang WebP để nén tốt hơn
      quality: 75,   // Chất lượng vừa phải (75%)
      recursive: true, // Xử lý cả thư mục con
      // Không resize để giữ nguyên kích thước ảnh gốc
    });
    
    console.log(`\n📊 Kết quả thư mục ${dir}:`);
    console.log(`  - Số ảnh đã xử lý: ${result.processed}`);
    console.log(`  - Số ảnh thất bại: ${result.failed}`);
    console.log(`  - Không gian tiết kiệm: ${formatBytes(result.savedSpace)}`);
    
    totalProcessed += result.processed;
    totalFailed += result.failed;
    totalSavedSpace += result.savedSpace;
  }
  
  console.log('\n====== KẾT QUẢ TỔNG QUAN ======');
  console.log(`Tổng số ảnh đã xử lý: ${totalProcessed}`);
  console.log(`Tổng số ảnh thất bại: ${totalFailed}`);
  console.log(`Tổng không gian tiết kiệm: ${formatBytes(totalSavedSpace)}`);
  console.log('===============================');
}

/**
 * Chuyển đổi bytes thành dạng đọc được
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Chạy script
main().catch(error => {
  console.error('❌ Lỗi khi tối ưu hóa hình ảnh:', error);
  process.exit(1);
});
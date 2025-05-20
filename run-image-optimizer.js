// Script chạy trực tiếp từ file optimize-images.ts
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import module tối ưu hóa ảnh trực tiếp
import { optimizeDirectory } from './server/utils/image-optimizer.js';

async function main() {
  try {
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
      'images',      // Ảnh khác
      'favicons'    // Favicon
    ];
    
    let totalProcessed = 0;
    let totalFailed = 0;
    let totalSavedSpace = 0;
    
    // Lặp qua từng thư mục con và tối ưu
    for (const dir of subDirectories) {
      const dirPath = path.join(uploadsDir, dir);
      
      // Kiểm tra xem thư mục có tồn tại không
      if (!fs.existsSync(dirPath)) {
        console.log(`\n⚠️ Bỏ qua thư mục không tồn tại: ${dir}`);
        continue;
      }
      
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
    
    console.log('\n====== TỔNG KẾT ======');
    console.log(`Tổng số ảnh đã xử lý: ${totalProcessed}`);
    console.log(`Tổng số ảnh thất bại: ${totalFailed}`);
    console.log(`Tổng không gian tiết kiệm: ${formatBytes(totalSavedSpace)}`);
    console.log('======================');
    
  } catch (error) {
    console.error('Lỗi khi tối ưu hóa ảnh:', error);
  }
}

/**
 * Chuyển đổi bytes thành dạng đọc được
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

main();
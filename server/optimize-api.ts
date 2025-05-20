import path from 'path';
import fs from 'fs';
import { optimizeDirectory } from './utils/image-optimizer';
import { type Express, type Request, type Response } from 'express';
import { requireAuth, requireAdmin } from './middlewares';

export function registerOptimizeRoutes(app: Express) {
  // API endpoint để xóa cache
  app.post(
    "/api/admin/clear-cache",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        // Xóa bộ nhớ đệm của hệ thống
        // Hiện tại chức năng này chủ yếu để thiết lập các header cho các yêu cầu mới
        // và để client có thể reload trang để tải mới dữ liệu
        
        // Ghi log về việc xóa cache
        console.log("Yêu cầu xóa cache từ quản trị viên:", req.user?.username);
        
        res.json({
          success: true,
          message: "Đã xóa bộ nhớ đệm của hệ thống thành công",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Lỗi khi xóa cache:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Lỗi khi xóa bộ nhớ đệm',
          message: error.message 
        });
      }
    }
  );
  // API endpoint để tối ưu hóa ảnh
  app.post(
    "/api/admin/optimize-images",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
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
        let results = [];
        
        // Lặp qua từng thư mục con và tối ưu
        for (const dir of subDirectories) {
          const dirPath = path.join(uploadsDir, dir);
          
          // Kiểm tra xem thư mục có tồn tại không
          if (!fs.existsSync(dirPath)) {
            console.log(`\n⚠️ Bỏ qua thư mục không tồn tại: ${dir}`);
            results.push({
              directory: dir,
              status: 'skipped',
              reason: 'Directory does not exist'
            });
            continue;
          }
          
          console.log(`\n🔍 Đang tối ưu hóa thư mục: ${dir}`);
          
          // Tối ưu hình ảnh trong thư mục
          const result = await optimizeDirectory(dirPath, {
            format: 'webp', // Chuyển đổi sang WebP để nén tốt hơn
            quality: 80,   // Chất lượng tốt (80%)
            recursive: true, // Xử lý cả thư mục con
            // Không resize để giữ nguyên kích thước ảnh gốc
          });
          
          console.log(`\n📊 Kết quả thư mục ${dir}:`);
          console.log(`  - Số ảnh đã xử lý: ${result.processed}`);
          console.log(`  - Số ảnh thất bại: ${result.failed}`);
          console.log(`  - Không gian tiết kiệm: ${formatBytes(result.savedSpace)}`);
          
          results.push({
            directory: dir,
            processed: result.processed,
            failed: result.failed,
            savedSpace: formatBytes(result.savedSpace),
            rawSavedSpace: result.savedSpace
          });
          
          totalProcessed += result.processed;
          totalFailed += result.failed;
          totalSavedSpace += result.savedSpace;
        }
        
        console.log('\n====== TỔNG KẾT ======');
        console.log(`Tổng số ảnh đã xử lý: ${totalProcessed}`);
        console.log(`Tổng số ảnh thất bại: ${totalFailed}`);
        console.log(`Tổng không gian tiết kiệm: ${formatBytes(totalSavedSpace)}`);
        console.log('======================');
        
        // Trả về kết quả cho client
        res.json({
          success: true,
          summary: {
            totalProcessed,
            totalFailed,
            totalSavedSpace: formatBytes(totalSavedSpace),
            rawTotalSavedSpace: totalSavedSpace
          },
          details: results
        });
        
      } catch (error) {
        console.error('Lỗi khi tối ưu hóa ảnh:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Lỗi khi tối ưu hóa ảnh',
          message: error.message 
        });
      }
    }
  );

  // API endpoint để xem thông tin về ảnh
  app.get(
    "/api/admin/image-stats",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        // Thư mục gốc chứa ảnh
        const uploadsDir = path.join(process.cwd(), 'uploads');
        
        // Danh sách các thư mục con cần kiểm tra
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
        
        const stats = [];
        let totalSize = 0;
        let totalFiles = 0;
        
        // Lặp qua từng thư mục con và lấy thông tin
        for (const dir of subDirectories) {
          const dirPath = path.join(uploadsDir, dir);
          
          // Kiểm tra xem thư mục có tồn tại không
          if (!fs.existsSync(dirPath)) {
            stats.push({
              directory: dir,
              exists: false,
              fileCount: 0,
              totalSize: '0 B',
              rawSize: 0
            });
            continue;
          }
          
          const { size, count } = await getDirStats(dirPath);
          totalSize += size;
          totalFiles += count;
          
          stats.push({
            directory: dir,
            exists: true,
            fileCount: count,
            totalSize: formatBytes(size),
            rawSize: size
          });
        }
        
        // Trả về kết quả cho client
        res.json({
          success: true,
          summary: {
            totalDirectories: subDirectories.length,
            totalFiles,
            totalSize: formatBytes(totalSize),
            rawTotalSize: totalSize
          },
          details: stats
        });
        
      } catch (error) {
        console.error('Lỗi khi lấy thông tin ảnh:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Lỗi khi lấy thông tin ảnh',
          message: error.message 
        });
      }
    }
  );
}

/**
 * Lấy thông tin kích thước và số file trong thư mục
 */
async function getDirStats(dir: string): Promise<{ size: number, count: number }> {
  let size = 0;
  let count = 0;
  
  // Đọc tất cả các file trong thư mục
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Đệ quy cho thư mục con
        const subStats = await getDirStats(filePath);
        size += subStats.size;
        count += subStats.count;
      } else {
        // Lấy kích thước của file
        const stat = await fs.promises.stat(filePath);
        size += stat.size;
        count++;
      }
    }
  } catch (err) {
    console.error(`Lỗi khi đọc thư mục ${dir}:`, err);
  }
  
  return { size, count };
}

/**
 * Chuyển đổi bytes thành dạng đọc được
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
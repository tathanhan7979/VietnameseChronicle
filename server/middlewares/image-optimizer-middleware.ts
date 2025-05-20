import { Request, Response, NextFunction } from 'express';
import { optimizeImage } from '../utils/image-optimizer';
import { log } from '../vite';

// Mở rộng thêm loại File để bổ sung imageInfo
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        imageInfo?: {
          webp: string;
          original: string;
          filename: string;
        };
      }
    }
  }
}

/**
 * Middleware tối ưu hóa hình ảnh sau khi đã tải lên
 * Sử dụng sau khi multer đã xử lý upload
 */
export async function optimizeUploadedImage(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Kiểm tra xem có file được upload không
    if (!req.file) {
      return next();
    }

    const originalSize = req.file.size;
    log(`🖼️ Tối ưu hóa ảnh: ${req.file.originalname} (${formatBytes(originalSize)})`, 'image-optimizer');

    // Thực hiện tối ưu hóa ảnh nhưng giữ lại ảnh gốc làm fallback
    const optimizedPath = await optimizeImage(req.file.path, {
      format: 'webp',  // Chuyển sang webp để nén tốt hơn
      quality: 80,     // Chất lượng 80% thường là sự cân bằng tốt
    });
    
    // Giữ lại đường dẫn gốc và webp
    const originalPath = req.file.path;
    const optimizedFilename = optimizedPath.split('/').pop() || req.file.filename;
    
    // Tạo URL của ảnh để trả về cho client
    const originalUrl = originalPath.replace(process.cwd(), '');
    const webpUrl = optimizedPath.replace(process.cwd(), '');
    
    // Tạo thông tin cần thiết cho picture tag để hỗ trợ fallback
    const imageInfo = {
      webp: webpUrl,
      original: originalUrl,
      filename: optimizedFilename,
      // HTML mẫu: <picture><source srcset="image.webp" type="image/webp"><img src="image.jpg" alt=""></picture>
    };
    
    // Lưu thông tin vào request để các bước sau có thể sử dụng
    req.file.imageInfo = imageInfo;
    
    // Vẫn cập nhật đường dẫn chính là phiên bản tối ưu
    req.file.filename = optimizedFilename;
    req.file.path = optimizedPath;
    
    // Tính toán tỷ lệ nén
    try {
      const fs = await import('fs');
      const stats = await fs.promises.stat(optimizedPath);
      const optimizedSize = stats.size;
      const compressionRatio = (originalSize - optimizedSize) / originalSize * 100;
      
      log(
        `✅ Tối ưu hóa hoàn tất: ${formatBytes(optimizedSize)} (giảm ${compressionRatio.toFixed(1)}%)`,
        'image-optimizer'
      );
    } catch (error) {
      log(`⚠️ Không thể tính toán thông tin file tối ưu`, 'image-optimizer');
    }
    
    next();
  } catch (error) {
    // Nếu có lỗi trong quá trình tối ưu, vẫn tiếp tục với file gốc
    log(`❌ Lỗi khi tối ưu ảnh: ${(error as Error).message}`, 'image-optimizer');
    next();
  }
}

/**
 * Middleware tối ưu hóa nhiều hình ảnh sau khi đã tải lên (array của multer)
 */
export async function optimizeUploadedImages(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Kiểm tra xem có các file được upload không
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next();
    }

    // Xử lý tối ưu từng file một
    const optimizationPromises = req.files.map(async (file: Express.Multer.File) => {
      const originalSize = file.size;
      log(`🖼️ Tối ưu hóa ảnh: ${file.originalname} (${formatBytes(originalSize)})`, 'image-optimizer');

      try {
        // Thực hiện tối ưu hóa ảnh nhưng giữ lại ảnh gốc
        const optimizedPath = await optimizeImage(file.path, {
          format: 'webp',
          quality: 80,
        });
        
        // Giữ lại đường dẫn gốc và webp
        const originalPath = file.path;
        const optimizedFilename = optimizedPath.split('/').pop() || file.filename;
        
        // Tạo URL của ảnh để trả về cho client
        const originalUrl = originalPath.replace(process.cwd(), '');
        const webpUrl = optimizedPath.replace(process.cwd(), '');
        
        // Tạo thông tin cần thiết cho picture tag để hỗ trợ fallback
        const imageInfo = {
          webp: webpUrl,
          original: originalUrl,
          filename: optimizedFilename,
        };
        
        // Lưu thông tin vào file để các bước sau có thể sử dụng
        file.imageInfo = imageInfo;
        
        // Vẫn cập nhật đường dẫn chính là phiên bản tối ưu
        file.filename = optimizedFilename;
        file.path = optimizedPath;
        
        // Tính toán tỷ lệ nén
        const fs = await import('fs');
        const stats = await fs.promises.stat(optimizedPath);
        const optimizedSize = stats.size;
        const compressionRatio = (originalSize - optimizedSize) / originalSize * 100;
        
        log(
          `✅ Tối ưu hóa hoàn tất: ${file.originalname} - ${formatBytes(optimizedSize)} (giảm ${compressionRatio.toFixed(1)}%)`,
          'image-optimizer'
        );
      } catch (error) {
        log(`❌ Lỗi khi tối ưu ảnh ${file.originalname}: ${(error as Error).message}`, 'image-optimizer');
      }
    });
    
    // Đợi tất cả các tác vụ tối ưu hoàn tất
    await Promise.all(optimizationPromises);
    
    next();
  } catch (error) {
    // Nếu có lỗi trong quá trình tối ưu, vẫn tiếp tục với file gốc
    log(`❌ Lỗi khi tối ưu nhiều ảnh: ${(error as Error).message}`, 'image-optimizer');
    next();
  }
}

/**
 * Định dạng bytes thành chuỗi dễ đọc
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
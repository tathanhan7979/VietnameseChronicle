import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Tối ưu hóa hình ảnh trước khi lưu với mức độ nén và kích thước phù hợp
 * @param filePath - Đường dẫn đến file ảnh cần tối ưu
 * @param options - Các tùy chọn tối ưu hóa 
 * @returns Promise<string> - Đường dẫn đến file đã tối ưu hóa
 */
export async function optimizeImage(
  filePath: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
  } = {}
): Promise<string> {
  try {
    // Thông số mặc định
    const outputQuality = options.quality || 80; // Mức nén mặc định 80%
    const outputFormat = options.format || 'webp'; // WebP có mức nén tốt
    
    // Đọc thông tin file
    const originalExt = path.extname(filePath);
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, originalExt);
    
    // Tạo đường dẫn file output
    const outputFilePath = path.join(fileDir, `${fileName}.${outputFormat}`);
    
    // Đọc file gốc vào buffer
    const imageBuffer = await fs.promises.readFile(filePath);
    
    // Tạo đối tượng Sharp từ buffer
    let sharpImage = sharp(imageBuffer);
    
    // Thực hiện resize nếu cần
    if (options.width || options.height) {
      sharpImage = sharpImage.resize({
        width: options.width,
        height: options.height,
        fit: 'inside', // Giữ tỷ lệ khung hình
        withoutEnlargement: true, // Không phóng to ảnh nhỏ
      });
    }
    
    // Chuyển đổi định dạng và nén
    switch (outputFormat) {
      case 'webp':
        sharpImage = sharpImage.webp({ quality: outputQuality });
        break;
      case 'jpeg':
        sharpImage = sharpImage.jpeg({ quality: outputQuality });
        break;
      case 'png':
        sharpImage = sharpImage.png({ quality: outputQuality });
        break;
      case 'avif':
        sharpImage = sharpImage.avif({ quality: outputQuality });
        break;
    }
    
    // Lưu file đã tối ưu
    await sharpImage.toFile(outputFilePath);
    
    // Xóa file gốc sau khi đã tối ưu (nếu không phải cùng định dạng)
    if (path.resolve(filePath) !== path.resolve(outputFilePath)) {
      await fs.promises.unlink(filePath);
    }
    
    // Trả về đường dẫn đến file đã tối ưu
    return outputFilePath;
  } catch (error) {
    console.error('Lỗi khi tối ưu hóa ảnh:', error);
    // Nếu có lỗi, trả về file gốc
    return filePath;
  }
}

/**
 * Tối ưu hóa một thư mục ảnh
 * @param dirPath - Đường dẫn đến thư mục chứa ảnh cần tối ưu
 * @param options - Các tùy chọn tối ưu hóa
 * @returns Promise<{ processed: number, failed: number, savedSpace: number }>
 */
export async function optimizeDirectory(
  dirPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    recursive?: boolean;
  } = {}
): Promise<{ processed: number; failed: number; savedSpace: number }> {
  try {
    // Kiểm tra xem đường dẫn có tồn tại không
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Thư mục không tồn tại: ${dirPath}`);
    }

    let processed = 0;
    let failed = 0;
    let savedSpace = 0;

    // Đọc tất cả các file trong thư mục
    const files = await fs.promises.readdir(dirPath);

    // Tạo danh sách các promises để xử lý song song
    const optimizationPromises = files.map(async (file) => {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);

      // Nếu là thư mục và cần đệ quy
      if (stats.isDirectory() && options.recursive) {
        const subResult = await optimizeDirectory(filePath, options);
        processed += subResult.processed;
        failed += subResult.failed;
        savedSpace += subResult.savedSpace;
        return;
      }

      // Kiểm tra xem file có phải là hình ảnh không
      const ext = path.extname(filePath).toLowerCase();
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      if (!supportedFormats.includes(ext)) {
        return;
      }

      try {
        // Lưu kích thước file trước khi tối ưu
        const originalSize = stats.size;
        
        // Tối ưu hóa ảnh
        const optimizedPath = await optimizeImage(filePath, options);
        
        // Lấy kích thước file sau khi tối ưu
        const optimizedSize = (await fs.promises.stat(optimizedPath)).size;
        
        // Tính toán không gian đã tiết kiệm
        const spaceSaved = originalSize - optimizedSize;
        
        processed++;
        savedSpace += spaceSaved;
        
        console.log(`✅ Đã tối ưu: ${file} (tiết kiệm ${formatBytes(spaceSaved)})`);
      } catch (error) {
        console.error(`❌ Lỗi tối ưu: ${file}`, error);
        failed++;
      }
    });

    // Chờ tất cả các file được xử lý
    await Promise.all(optimizationPromises);

    return { processed, failed, savedSpace };
  } catch (error) {
    console.error('Lỗi khi tối ưu hóa thư mục:', error);
    return { processed: 0, failed: 0, savedSpace: 0 };
  }
}

/**
 * Chuyển đổi bytes thành dạng đọc được
 * @param bytes - Số bytes
 * @returns string - Kích thước đọc được
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
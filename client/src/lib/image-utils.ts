/**
 * Hàm chuyển đổi URL hình ảnh sang định dạng WebP tối ưu hóa
 * Với phương án dự phòng cho các trường hợp không có WebP
 */
export function getOptimizedImageUrl(url: string | null | undefined): string {
  // Nếu URL không tồn tại, trả về ảnh mặc định
  if (!url) return '/uploads/error-img.png';
  
  // Nếu là URL bên ngoài, giữ nguyên
  if (url.startsWith('http')) {
    return url;
  }
  
  // Nếu là URL nội bộ
  if (url.startsWith('/')) {
    // Nếu đã là định dạng WebP, giữ nguyên
    if (url.endsWith('.webp')) return url;
    
    // Lấy phần đường dẫn cơ bản và extension
    const lastDotIndex = url.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const basePath = url.substring(0, lastDotIndex);
      // Tạo đường dẫn WebP
      return `${basePath}.webp`;
    }
  }
  
  // Trường hợp mặc định trả về URL gốc
  return url;
}

/**
 * Hàm xử lý lỗi khi tải hình ảnh WebP, 
 * tự động chuyển sang định dạng gốc nếu WebP không khả dụng
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalSrc: string | null | undefined): void {
  if (!originalSrc) {
    e.currentTarget.src = '/uploads/error-img.png';
    return;
  }
  
  const currentSrc = e.currentTarget.src;
  
  // Kiểm tra nếu đang tải phiên bản WebP và bị lỗi
  if (currentSrc.endsWith('.webp') && originalSrc.startsWith('/')) {
    console.log('Chuyển từ WebP sang định dạng gốc:', originalSrc);
    e.currentTarget.src = originalSrc; // Thử tải lại với URL gốc
  } else {
    // Không phải lỗi WebP hoặc đã thử dùng URL gốc, chuyển sang ảnh lỗi
    console.error('Lỗi khi tải hình ảnh:', originalSrc);
    e.currentTarget.src = '/uploads/error-img.png';
  }
}

/**
 * Hàm cũ được giữ lại cho khả năng tương thích ngược
 * @deprecated Sử dụng getOptimizedImageUrl thay thế
 */
export function getImageUrlWithTimestamp(url: string | null | undefined): string {
  return getOptimizedImageUrl(url);
}
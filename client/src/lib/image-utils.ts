/**
 * Hàm xử lý URL hình ảnh để tránh bị cache
 * Thêm timestamp nếu là URL nội bộ
 */
export function getImageUrlWithTimestamp(url: string | null | undefined): string {
  // Nếu URL không tồn tại, trả về ảnh mặc định
  if (!url) return '/uploads/error-img.png';
  
  // Nếu là URL nội bộ (bắt đầu bằng /), thêm timestamp
  if (url.startsWith('/')) {
    const timestamp = new Date().getTime();
    return `${url}?t=${timestamp}`;
  }
  
  // Nếu là URL bên ngoài, giữ nguyên
  return url;
}

/**
 * Hàm xử lý lỗi ảnh và ghi log
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalSrc: string | null | undefined): void {
  console.error('Lỗi khi tải hình ảnh:', originalSrc || 'URL không xác định');
  e.currentTarget.src = '/uploads/error-img.png';
}
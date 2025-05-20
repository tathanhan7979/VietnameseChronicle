import React from 'react';

// Định nghĩa props cho component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Component hỗ trợ hiển thị ảnh được tối ưu hóa
 * - Tự động sử dụng WebP khi trình duyệt hỗ trợ
 * - Fallback về định dạng khác khi trình duyệt không hỗ trợ WebP
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  width,
  height,
}) => {
  // Xác định các đường dẫn
  const webpSrc = src.endsWith('.webp') ? src : `${src.replace(/\.[^/.]+$/, '')}.webp`;
  const originalSrc = src.endsWith('.webp') ? src.replace('.webp', '') : src;
  const imgFallbackSrc = fallbackSrc || '/uploads/error-img.png'; // Fallback khi lỗi ảnh

  // Xử lý lỗi khi không thể tải ảnh
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.target as HTMLImageElement;
    if (imgElement.src !== imgFallbackSrc) {
      imgElement.src = imgFallbackSrc;
    }
  };

  return (
    <picture>
      {/* Nguồn WebP cho các trình duyệt hỗ trợ */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Nguồn ảnh gốc cho các trình duyệt không hỗ trợ WebP */}
      <img
        src={originalSrc}
        alt={alt}
        className={className}
        onError={handleError}
        width={width}
        height={height}
        loading="lazy" // Lazy loading để cải thiện hiệu suất
      />
    </picture>
  );
};

export default OptimizedImage;
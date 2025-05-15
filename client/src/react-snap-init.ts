/**
 * Script hỗ trợ cho React-Snap
 */

// Bảo đảm HTML có thông tin SEO cơ bản
export function prepareDocumentForSnapRender() {
  // Chỉ thực hiện trong môi trường Node (react-snap)
  if (typeof window !== 'undefined' && navigator.userAgent.includes('ReactSnap')) {
    console.log('Preparing document for React Snap rendering');
    
    // Thêm meta tags cần thiết
    const head = document.head;
    const metaTags = [
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
      { property: 'og:site_name', content: 'Lịch Sử Việt Nam' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ];
    
    // Thêm các meta tags
    metaTags.forEach(meta => {
      const metaTag = document.createElement('meta');
      Object.entries(meta).forEach(([key, value]) => {
        metaTag.setAttribute(key, value);
      });
      head.appendChild(metaTag);
    });
    
    // Thêm canonical URL
    const canonicalUrl = `https://lichsuviet.edu.vn${window.location.pathname}`;
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', canonicalUrl);
    
    if (!document.querySelector('link[rel="canonical"]')) {
      head.appendChild(canonicalLink);
    }
    
    // Xác định title nếu chưa có
    if (!document.title) {
      document.title = 'Lịch sử Việt Nam - Khám phá dòng chảy lịch sử dân tộc Việt';
    }
    
    // Thêm lang attribute cho html tag
    document.documentElement.setAttribute('lang', 'vi');
  }
}

// Ngăn chặn lỗi trong quá trình prerender
export function preventPreRenderErrors() {
  if (typeof window !== 'undefined') {
    // Xử lý window.matchMedia cho react-snap
    if (!window.matchMedia) {
      // @ts-ignore - Chúng ta biết đây là polyfill đơn giản
      window.matchMedia = () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
      });
    }
    
    // Xử lý Facebook SDK
    // @ts-ignore - Facebook SDK có thể không tồn tại
    if (!window.FB) {
      // @ts-ignore - Chúng ta tạo mock
      window.FB = {
        init: () => {},
        XFBML: { parse: () => {} }
      };
    }
  }
}

// Thiết lập snap save state
export function setupSnapSaveState() {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Type definition không tồn tại
    window.snapSaveState = () => {
      return {
        __PRELOADED_STATE__: {}
      };
    };
  }
}
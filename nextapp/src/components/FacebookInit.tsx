import { useEffect } from 'react';
import { FACEBOOK_APP_ID } from '@/lib/constants';

export default function FacebookInit() {
  useEffect(() => {
    // Chỉ tải SDK một lần
    if (document.getElementById('facebook-jssdk')) return;

    // Tải FB SDK
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0&appId=${FACEBOOK_APP_ID}`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    // Thêm script vào document
    document.body.appendChild(script);

    // Cleanup khi component unmount
    return () => {
      // Nên giữ Facebook SDK trên trang nên không xóa script
      // nhưng reset lại state nếu cần
      if (window.FB) {
        try {
          // Parse lại XFBML khi có thay đổi
          window.FB.XFBML.parse();
        } catch (e) {
          console.error('Lỗi khi parse XFBML:', e);
        }
      }
    };
  }, []);

  return null; // Component này không render bất kỳ DOM nào
}
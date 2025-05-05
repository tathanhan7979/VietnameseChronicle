import { useEffect } from 'react';
import { FACEBOOK_APP_ID } from '@/lib/constants';

export default function FacebookInit() {
  useEffect(() => {
    // Thêm Facebook SDK vào trang web
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0&appId=${FACEBOOK_APP_ID}`;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      // Add root div for FB
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.insertBefore(fbRoot, document.body.firstChild);
      
      // Add the script
      document.body.appendChild(script);
    }
  }, []);

  return null; // Component không render UI
}

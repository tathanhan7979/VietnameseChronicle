import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

interface FacebookCommentsProps {
  url: string;
}

declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
    };
  }
}

const FACEBOOK_APP_ID = '198066915623'; // App ID for the Facebook Comments integration

function ensureFBSDKLoaded(callback: () => void) {
  if (window.FB) {
    callback();
    return;
  }

  const fbSDKScript = document.createElement('script');
  fbSDKScript.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0&appId=${FACEBOOK_APP_ID}`;
  fbSDKScript.async = true;
  fbSDKScript.defer = true;
  fbSDKScript.crossOrigin = 'anonymous';
  fbSDKScript.onload = callback;
  
  document.body.appendChild(fbSDKScript);
}

export default function FacebookComments({ url }: FacebookCommentsProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ensureFBSDKLoaded(() => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      });
    }

    return () => {
      // Cleanup function if needed
    };
  }, [url, router.asPath]);

  return (
    <div className="fb-comments-container">
      <h3 className="text-xl font-semibold mb-4 text-red-600">Bình luận</h3>

      <Script
        src={`https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0&appId=${FACEBOOK_APP_ID}`}
        strategy="lazyOnload"
      />

      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="10"
        data-order-by="reverse_time"
        data-lazy="true" 
        data-mobile="true"
      ></div>
    </div>
  );
}
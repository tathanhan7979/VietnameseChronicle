import { useEffect } from 'react';
import { FACEBOOK_APP_ID } from '@/lib/constants';

interface FacebookCommentsProps {
  url: string;
  width?: string;
  numPosts?: number;
  colorscheme?: 'light' | 'dark';
  orderBy?: 'social' | 'reverse_time' | 'time';
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

export default function FacebookComments({
  url,
  width = '100%',
  numPosts = 5,
  colorscheme = 'light',
  orderBy = 'social'
}: FacebookCommentsProps) {
  useEffect(() => {
    // Load Facebook SDK asynchronously if it hasn't been loaded
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0&appId=${FACEBOOK_APP_ID}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.FB) {
      // If SDK is loaded, parse XFBML to render comments
      window.FB.XFBML.parse();
    }
  }, [url]); // Re-render comments when URL changes

  return (
    <div className="fb-comments-container bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))] pb-2 border-b">
        Bình luận
      </h3>
      <div 
        className="fb-comments" 
        data-href={url}
        data-width={width}
        data-numposts={numPosts.toString()}
        data-colorscheme={colorscheme}
        data-order-by={orderBy}
      ></div>
    </div>
  );
}

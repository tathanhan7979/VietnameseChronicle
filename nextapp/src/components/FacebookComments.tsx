import { useEffect, useRef } from 'react';
import { FACEBOOK_APP_ID } from '@/lib/constants';

interface FacebookCommentsProps {
  url: string;
}

export default function FacebookComments({ url }: FacebookCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Đảm bảo FB SDK đã được tải
    const initFacebookComments = () => {
      if (window.FB) {
        // Nếu FB SDK đã có, render XFBML
        window.FB.XFBML.parse(commentsRef.current);
      } else {
        // Nếu không thì đợi 1 giây và thử lại
        setTimeout(initFacebookComments, 1000);
      }
    };

    initFacebookComments();
  }, [url]);

  return (
    <div ref={commentsRef} className="mt-8">
      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="5"
        data-order-by="reverse_time"
        data-colorscheme="light"
        data-lazy="true"
        data-mobile="true"
      ></div>
    </div>
  );
}

// Định nghĩa type cho window global
declare global {
  interface Window {
    FB: {
      XFBML: {
        parse: (element?: HTMLElement | null) => void;
      };
      init: () => void;
    };
  }
}
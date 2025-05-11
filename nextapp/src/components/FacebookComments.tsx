import React, { useEffect } from 'react';

interface FacebookCommentsProps {
  url: string;
}

declare global {
  interface Window {
    FB: any;
  }
}

const FacebookComments: React.FC<FacebookCommentsProps> = ({ url }) => {
  useEffect(() => {
    // Nếu FB SDK đã được load, render lại comments
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [url]);

  return (
    <div className="fb-comments-container mt-8 mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-red-600">Bình luận</h3>
      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="5"
        data-order-by="social"
        data-colorscheme="light"
        data-lazy="true"
        data-mobile="true"
      ></div>
    </div>
  );
};

export default FacebookComments;
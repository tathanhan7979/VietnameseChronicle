import { useEffect, useRef } from 'react';

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
  const commentsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Re-parse Facebook XFBML when URL changes
    if (window.FB) {
      window.FB.XFBML.parse(commentsRef.current || undefined);
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

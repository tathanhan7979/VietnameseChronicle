import { useEffect } from "react";

interface FacebookCommentsProps {
  url: string;
}

export default function FacebookComments({ url }: FacebookCommentsProps) {
  useEffect(() => {
    // Reload Facebook SDK after component mounts
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [url]); // Re-run when URL changes

  return (
    <div className="fb-comments-container bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))] pb-2 border-b flex items-center justify-between">
        <span>Bình luận</span>
      </h3>
      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="10"
        data-order-by="reverse_time"
        data-lazy="true"
        data-mobile="false"
      ></div>
    </div>
  );
}

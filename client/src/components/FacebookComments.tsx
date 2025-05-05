interface FacebookCommentsProps {
  url: string;
}

export default function FacebookComments({
  url
}: FacebookCommentsProps) {
  return (
    <div className="fb-comments-container bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))] pb-2 border-b">
        Bình luận
      </h3>
      <div 
        className="fb-comments" 
        data-href={url} 
        data-width="100%" 
        data-numposts="5"
        data-order-by="reverse_time"
        data-lazy="true"
        data-mobile="true"
      ></div>
    </div>
  );
}

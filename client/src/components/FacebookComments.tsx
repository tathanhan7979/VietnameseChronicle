interface FacebookCommentsProps {
  url: string;
}

export default function FacebookComments({
  url
}: FacebookCommentsProps) {
  return (
    <div className="fb-comments-container bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))] pb-2 border-b flex items-center justify-between">
        <span>Bình luận</span>
        <span className="text-sm font-normal text-gray-600 flex items-center">
          <span className="fb-comments-count" data-href={url}></span> <span className="ml-1">bình luận</span>
        </span>
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

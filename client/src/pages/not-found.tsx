import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Clock, Map, ScrollText, Users, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center py-20 px-4">
      {/* Hình nền trang trí */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/dragon-pattern.svg')] bg-repeat rotate-12 scale-150 opacity-30"></div>
      </div>

      {/* Hình ảnh trang trí */}
      <div className="absolute -bottom-6 -left-24 w-72 h-72 opacity-10 rotate-12">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 22V12h6v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute -top-10 -right-10 w-72 h-72 opacity-10 -rotate-12">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M2 22l2-2m0 0L12 4l8 10M4 20h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Nội dung chính */}
      <div className="relative max-w-3xl mx-auto text-center mb-6">
        <div className="text-9xl font-bold text-red-700 mb-4 tracking-tighter">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-red-800 mb-3">
          Không tìm thấy dữ liệu
        </h1>
        <p className="text-lg text-amber-900 max-w-lg mx-auto mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Có thể bạn muốn khám phá lịch sử Việt Nam từ những trang khác?
        </p>
      </div>

      {/* Các đường dẫn */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mb-8">
        <Link href="/tim-kiem">
          <div className="flex items-center gap-3 p-4 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-amber-100 transition-all hover:shadow group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Tìm kiếm</h3>
              <p className="text-sm text-amber-700">Tìm kiếm nâng cao</p>
            </div>
          </div>
        </Link>

        <Link href="/nhan-vat">
          <div className="flex items-center gap-3 p-4 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-amber-100 transition-all hover:shadow group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Nhân vật</h3>
              <p className="text-sm text-amber-700">Những anh hùng dân tộc</p>
            </div>
          </div>
        </Link>

        <Link href="/di-tich">
          <div className="flex items-center gap-3 p-4 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-amber-100 transition-all hover:shadow group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
              <Map className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Di tích</h3>
              <p className="text-sm text-amber-700">Điểm đến lịch sử</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Nút quay lại */}
      <Button
        onClick={() => (window.location.href = "/")}
        variant="outline"
        className="relative flex items-center gap-2 border-amber-200 hover:border-amber-300 text-amber-800 hover:bg-amber-50"
      >
        <MoveLeft className="w-4 h-4" />
        Quay lại trang chủ
      </Button>
    </div>
  );
}

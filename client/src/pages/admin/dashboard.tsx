import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { getQueryFn } from '@/lib/queryClient';
import {
  BarChart3,
  Clock,
  MessageCircle,
  Search,
  UserPlus,
  MapPin,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStats {
  periodsCount: number;
  eventsCount: number;
  figuresCount: number;
  sitesCount: number;
  eventTypesCount: number;
  pendingFeedbackCount: number;
  visitsCount: number;
  searchCount: number;
}

export default function AdminDashboard() {
  const { data: stats, error, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const statCards = [
    {
      title: 'Thời kỳ lịch sử',
      value: stats?.periodsCount || 0,
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Sự kiện lịch sử',
      value: stats?.eventsCount || 0,
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
    {
      title: 'Nhân vật lịch sử',
      value: stats?.figuresCount || 0,
      icon: <UserPlus className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Địa danh lịch sử',
      value: stats?.sitesCount || 0,
      icon: <MapPin className="h-8 w-8 text-yellow-600" />,
      color: 'bg-yellow-50',
    },
    {
      title: 'Loại sự kiện',
      value: stats?.eventTypesCount || 0,
      icon: <FileText className="h-8 w-8 text-red-600" />,
      color: 'bg-red-50',
    },
    {
      title: 'Phản hồi chưa xử lý',
      value: stats?.pendingFeedbackCount || 0,
      icon: <MessageCircle className="h-8 w-8 text-orange-600" />,
      color: 'bg-orange-50',
    },
    {
      title: 'Lượt truy cập',
      value: stats?.visitsCount || 0,
      icon: <UserPlus className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Lượt tìm kiếm',
      value: stats?.searchCount || 0,
      icon: <Search className="h-8 w-8 text-pink-600" />,
      color: 'bg-pink-50',
    },
  ];

  return (
    <AdminLayout title="Tổng quan hệ thống">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-medium">Lỗi khi tải dữ liệu</h3>
          <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
              <Card key={index}>
                <CardHeader className={`${card.color} rounded-t-lg py-3`}>
                  <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex justify-between items-center">
                  <span className="text-3xl font-bold">{card.value.toLocaleString()}</span>
                  {card.icon}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cần xử lý gấp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.pendingFeedbackCount ? (
                    <div className="bg-orange-50 p-4 rounded-lg flex items-start space-x-3">
                      <MessageCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">
                          {stats.pendingFeedbackCount} phản hồi chưa xử lý
                        </h4>
                        <p className="text-orange-700 text-sm">
                          Vui lòng xem và phản hồi cho người dùng
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6">
Không có việc cần xử lý gấp!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Sắp xếp nội dung bằng cách kéo thả</h4>
                    <p className="text-sm text-gray-600">
                      Tất cả các mục nội dung đều có thể điều chỉnh thứ tự hiển thị bằng cách kéo thả. Truy cập vào từng mục để sắp xếp.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Quản lý ảnh</h4>
                    <p className="text-sm text-gray-600">
                      Bạn có thể tải lên ảnh hoặc nhập URL ảnh. Khi cập nhật, bạn cũng có thể xóa ảnh hiện tại và thay thế bằng ảnh mới.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, FileImage } from 'lucide-react';

interface ImageStats {
  success: boolean;
  summary: {
    totalDirectories: number;
    totalFiles: number;
    totalSize: string;
    rawTotalSize: number;
  };
  details: Array<{
    directory: string;
    exists: boolean;
    fileCount: number;
    totalSize: string;
    rawSize: number;
  }>;
}

interface OptimizationResult {
  success: boolean;
  summary: {
    totalProcessed: number;
    totalFailed: number;
    totalSavedSpace: string;
    rawTotalSavedSpace: number;
  };
  details: Array<{
    directory: string;
    processed: number;
    failed: number;
    savedSpace: string;
    rawSavedSpace: number;
    status?: string;
    reason?: string;
  }>;
}

const ImageOptimizer = () => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);

  // Fetch image stats
  const { 
    data: imageStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery<ImageStats>({
    queryKey: ['/api/admin/image-stats'],
    staleTime: 0, // Always refresh when requested
  });

  // Optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      setIsOptimizing(true);
      const response = await apiRequest('POST', '/api/admin/optimize-images');
      return await response.json();
    },
    onSuccess: (data: OptimizationResult) => {
      setOptimizationResults(data);
      if (data.success) {
        toast({
          title: 'Tối ưu hóa thành công',
          description: `Đã xử lý ${data.summary.totalProcessed} ảnh, tiết kiệm ${data.summary.totalSavedSpace} dung lượng.`,
        });
        // Refresh stats after optimization
        refetchStats();
      } else {
        toast({
          title: 'Tối ưu hóa thất bại',
          description: 'Đã xảy ra lỗi trong quá trình tối ưu hóa ảnh.',
          variant: 'destructive',
        });
      }
      setIsOptimizing(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Tối ưu hóa thất bại',
        description: error.message,
        variant: 'destructive',
      });
      setIsOptimizing(false);
    },
  });

  const handleOptimize = () => {
    if (confirm('Bạn có chắc chắn muốn tối ưu hóa tất cả hình ảnh không? Quá trình này có thể mất vài phút.')) {
      optimizeMutation.mutate();
    }
  };

  const formatDirectoryName = (name: string) => {
    switch (name) {
      case 'events':
        return 'Sự kiện';
      case 'figures':
        return 'Nhân vật';
      case 'sites':
        return 'Di tích';
      case 'backgrounds':
        return 'Ảnh nền';
      case 'news':
        return 'Tin tức';
      case 'contributors':
        return 'Người đóng góp';
      case 'images':
        return 'Hình ảnh khác';
      case 'favicons':
        return 'Favicon';
      default:
        return name;
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Tối ưu hóa hình ảnh - Quản trị</title>
      </Helmet>

      <div className="container mx-auto my-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tối ưu hóa hình ảnh</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => refetchStats()}
              disabled={statsLoading}
            >
              {statsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Cập nhật
            </Button>
            <Button 
              onClick={handleOptimize} 
              disabled={isOptimizing || statsLoading}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tối ưu...
                </>
              ) : (
                <>
                  <FileImage className="h-4 w-4 mr-2" />
                  Tối ưu tất cả ảnh
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê hình ảnh</CardTitle>
            <CardDescription>
              Thông tin về kích thước và số lượng hình ảnh trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : imageStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tổng thư mục</h3>
                    <p className="text-2xl font-bold">{imageStats.summary.totalDirectories}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tổng tập tin</h3>
                    <p className="text-2xl font-bold">{imageStats.summary.totalFiles}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tổng dung lượng</h3>
                    <p className="text-2xl font-bold">{imageStats.summary.totalSize}</p>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thư mục</TableHead>
                        <TableHead>Số tập tin</TableHead>
                        <TableHead>Dung lượng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imageStats.details.map((item) => (
                        <TableRow key={item.directory}>
                          <TableCell className="font-medium">
                            {formatDirectoryName(item.directory)}
                          </TableCell>
                          <TableCell>{item.fileCount}</TableCell>
                          <TableCell>{item.totalSize}</TableCell>
                          <TableCell>
                            {item.exists ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không thể tải thông tin hình ảnh
              </div>
            )}
          </CardContent>
        </Card>

        {optimizationResults && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả tối ưu hóa</CardTitle>
              <CardDescription>
                Thông tin chi tiết về kết quả tối ưu hóa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Ảnh đã xử lý</h3>
                  <p className="text-2xl font-bold">{optimizationResults.summary.totalProcessed}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Xử lý thất bại</h3>
                  <p className="text-2xl font-bold">{optimizationResults.summary.totalFailed}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Dung lượng tiết kiệm</h3>
                  <p className="text-2xl font-bold">{optimizationResults.summary.totalSavedSpace}</p>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thư mục</TableHead>
                      <TableHead>Ảnh đã xử lý</TableHead>
                      <TableHead>Ảnh thất bại</TableHead>
                      <TableHead>Dung lượng tiết kiệm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationResults.details.map((item) => (
                      <TableRow key={item.directory}>
                        <TableCell className="font-medium">
                          {formatDirectoryName(item.directory)}
                        </TableCell>
                        <TableCell>
                          {item.status === 'skipped' ? (
                            <span className="text-muted-foreground">Bỏ qua</span>
                          ) : (
                            item.processed
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === 'skipped' ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            item.failed
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === 'skipped' ? (
                            <span className="text-yellow-500 text-sm">{item.reason}</span>
                          ) : (
                            item.savedSpace
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Tối ưu hóa hoàn tất lúc: {new Date().toLocaleString('vi-VN')}
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ImageOptimizer;
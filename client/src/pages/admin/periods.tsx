import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Clock, Edit, MoreHorizontal, Plus, Trash, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastError } from '@/components/ui/toast-error';
import { type Period } from '@shared/schema';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const periodFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên thời kỳ'),
  timeframe: z.string().min(1, 'Vui lòng nhập khung thời gian'),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  slug: z.string().optional(),
});

type PeriodFormValues = z.infer<typeof periodFormSchema>;

export default function PeriodsAdmin() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingPeriodId, setDeletingPeriodId] = useState<number | null>(null);
  const [periodsState, setPeriodsState] = useState<Period[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<{title: string; message: string; status?: number} | null>(null);

  // Lấy danh sách các thời kỳ
  const { data: periods, isLoading, refetch } = useQuery<Period[]>({
    queryKey: ['/api/admin/periods'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Cập nhật state periodsState khi periods thay đổi
  useEffect(() => {
    if (periods) {
      setPeriodsState([...periods].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [periods]);

  // Form tạo mới
  const createForm = useForm<PeriodFormValues>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      name: '',
      timeframe: '',
      description: '',
      slug: '',
    },
  });

  // Form chỉnh sửa
  const editForm = useForm<PeriodFormValues>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      name: '',
      timeframe: '',
      description: '',
      slug: '',
    },
  });

  // Tạo thời kỳ mới
  const createMutation = useMutation({
    mutationFn: async (data: PeriodFormValues) => {
      const res = await apiRequest('POST', '/api/admin/periods', data);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi tạo thời kỳ');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Thêm thời kỳ mới thành công',
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cập nhật thời kỳ
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PeriodFormValues }) => {
      const res = await apiRequest('PUT', `/api/admin/periods/${id}`, data);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi cập nhật thời kỳ');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Cập nhật thời kỳ thành công',
      });
      setIsEditDialogOpen(false);
      setEditingPeriod(null);
      editForm.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Xóa thời kỳ
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/periods/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Lỗi khi xóa thời kỳ');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Xóa thời kỳ thành công',
      });
      setIsConfirmDeleteOpen(false);
      setDeletingPeriodId(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
      setIsConfirmDeleteOpen(false);
    },
  });

  // Sắp xếp thứ tự thời kỳ
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      try {
        setError(null); // Xóa lỗi trước khi gọi API
        
        // Đảm bảo gửi dữ liệu với orderedIds là một mảng
        const requestBody = { orderedIds };
        console.log('Sending body to API:', JSON.stringify(requestBody));
        
        const res = await apiRequest('PUT', '/api/admin/periods/reorder', requestBody);
        console.log('API response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.log('Error data:', errorData);
          throw new Error(errorData.message || 'Lỗi khi sắp xếp thứ tự');
        }
        return res.json();
      } catch (error: any) {
        console.error('Lỗi khi gọi API reorder:', error);
        // Lưu lỗi để hiển thị component lỗi
        setError({
          title: 'Không thể sắp xếp thời kỳ',
          message: error.message || 'Có lỗi xảy ra khi sắp xếp thứ tự',
          status: error.status || 400
        });
        throw error;
      }
    },
    onSuccess: () => {
      setError(null);
      toast({
        title: 'Thành công',
        description: 'Cập nhật thứ tự thành công',
      });
      refetch();
    },
    onError: (error: Error) => {
      // Không cần hiển thị toast nữa vì đã có component
      // toast({
      //   title: 'Không thể sắp xếp thời kỳ',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });

  const onCreateSubmit = (values: PeriodFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: PeriodFormValues) => {
    if (!editingPeriod) return;
    updateMutation.mutate({ id: editingPeriod.id, data: values });
  };

  const handleEditPeriod = (period: Period) => {
    setEditingPeriod(period);
    editForm.reset({
      name: period.name,
      timeframe: period.timeframe,
      description: period.description,
      slug: period.slug,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeletePeriod = (id: number) => {
    setDeletingPeriodId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPeriodId) {
      deleteMutation.mutate(deletingPeriodId);
    }
  };

  // Xử lý sự kiện kéo thả hoàn tất
  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    // Nếu không có điểm đến hợp lệ hoặc không di chuyển
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Tạo một bản sao của mảng để cập nhật
    const updatedPeriods = [...periodsState];
    
    // Lấy item được kéo
    const draggedItem = updatedPeriods[result.source.index];
    
    // Xóa item khỏi vị trí cũ
    updatedPeriods.splice(result.source.index, 1);
    
    // Thêm item vào vị trí mới
    updatedPeriods.splice(result.destination.index, 0, draggedItem);
    
    // Cập nhật state
    setPeriodsState(updatedPeriods);
    
    // Gửi yêu cầu cập nhật thứ tự lên server
    // Tạo một mảng orderedIds chứa các ID của thời kỳ theo thứ tự mới
    const orderedIds = updatedPeriods.map(period => period.id);
    console.log('Gửi yêu cầu reorder:', { orderedIds });
    // Đảm bảo gửi dữ liệu đúng format cần thiết đến API
    reorderMutation.mutate(orderedIds);
  };
  
  // Bắt đầu kéo thả
  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <AdminLayout title="Quản lý thời kỳ lịch sử">
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <ToastError
          title={error.title}
          message={error.message}
          status={error.status}
          onClose={() => setError(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Danh sách thời kỳ</h2>
          <p className="text-gray-500">
            Quản lý các thời kỳ lịch sử của Việt Nam
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm thời kỳ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {(!periodsState || periodsState.length === 0) ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                Chưa có thời kỳ nào
              </h3>
              <p className="text-gray-500 mb-4">
                Bắt đầu bằng cách thêm thời kỳ lịch sử đầu tiên.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm thời kỳ mới
              </Button>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-500 mb-4 italic">
                Kéo và thả các thẻ để sắp xếp thứ tự hiển thị thời kỳ trên trang chủ và các danh sách.
              </p>
              
              <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Droppable droppableId="periods-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {periodsState.map((period, index) => (
                        <Draggable
                          key={period.id.toString()}
                          draggableId={period.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'z-50' : ''}`}
                            >
                              <Card className={`overflow-hidden ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}>
                                <CardHeader className="bg-blue-50 py-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                      </div>
                                      <CardTitle className="text-lg font-medium text-blue-900">
                                        {period.name}
                                      </CardTitle>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEditPeriod(period)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeletePeriod(period.id)}
                                          className="text-red-600"
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Xóa
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                  <div className="flex items-center text-gray-500 mb-2">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{period.timeframe}</span>
                                  </div>
                                  <p className="text-gray-600 line-clamp-3">{period.description}</p>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </>
      )}

      {/* Tạo thời kỳ mới */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Thêm thời kỳ mới</DialogTitle>
            <DialogDescription>
              Điền thông tin về thời kỳ lịch sử mới.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thời kỳ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên thời kỳ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khung thời gian</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: 1010 - 1225" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả ngắn về thời kỳ"
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL-friendly slug"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Chỉnh sửa thời kỳ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thời kỳ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin về thời kỳ lịch sử.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thời kỳ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên thời kỳ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khung thời gian</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: 1010 - 1225" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả ngắn về thời kỳ"
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL-friendly slug"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Xác nhận xóa */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa thời kỳ này? Đây là hành động không thể hoàn tác.{' '}
              Lưu ý: Thời kỳ có sự kiện hoặc địa danh liên kết sẽ không thể bị xóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

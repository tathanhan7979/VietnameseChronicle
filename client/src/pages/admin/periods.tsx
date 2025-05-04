import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Clock, Edit, MoreHorizontal, Plus, Trash, GripVertical, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToastError } from '@/components/ui/toast-error';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type Period } from '@shared/schema';
// Sử dụng thư viện DND-Kit để tránh cảnh báo defaultProps và có trải nghiệm kéo thả tốt hơn
import { DndContext, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
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
  
  // State cho modal xử lý các mục liên kết
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [relatedItemsData, setRelatedItemsData] = useState<{
    periodName: string;
    events: any[];
    figures: any[];
    sites: any[];
    availablePeriods: Period[];
  } | null>(null);
  const [targetPeriodId, setTargetPeriodId] = useState<number | null>(null);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignOption, setReassignOption] = useState<'reassign' | 'delete'>('reassign');

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

  // Sắp xếp thứ tự thời kỳ - API mới dùng POST đơn giản
  const reorderMutation = useMutation({
    mutationFn: async (idsArray: number[]) => {
      try {
        setError(null); // Xóa lỗi trước khi gọi API
        
        // Kiểm tra dữ liệu
        if (!Array.isArray(idsArray) || idsArray.length === 0) {
          throw new Error('Danh sách ID không hợp lệ');
        }
        
        // Chuyển đổi ID sang số nguyên
        const numericIds = idsArray.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        
        console.log('Danh sách ID gửi đi:', numericIds);
        
        // Gọi API mới với POST request trực tiếp mảng ID
        const res = await apiRequest('POST', '/api/periods/sort', numericIds);
        console.log('API response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.log('Error data:', errorData);
          throw new Error(errorData.message || 'Lỗi khi sắp xếp thứ tự');
        }
        
        let responseData;
        try {
          responseData = await res.json();
        } catch (err) {
          // Nếu không thể đọc JSON, trả về object trống
          responseData = { success: true, message: 'Hoàn tất' };
        }
        return responseData;
      } catch (error: any) {
        console.error('Lỗi khi gọi API sort:', error);
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
      // Log lỗi để debug
      console.error('Mutation error:', error);
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

  const confirmDelete = async () => {
    if (!deletingPeriodId) return;

    try {
      // Gọi API để xóa thời kỳ
      const res = await apiRequest('DELETE', `/api/admin/periods/${deletingPeriodId}`);
      const data = await res.json();

      // Kiểm tra nếu có lỗi vì có mục liên kết
      console.log('Response data:', data, 'Status:', res.status);
      // Nếu có lỗi 400 và có dữ liệu trả về, hiển thị modal 
      if (res.status === 400 && data.data) {
        // Đóng modal xác nhận xóa và mở modal quản lý mục liên kết
        setIsConfirmDeleteOpen(false);
        setRelatedItemsData(data.data);
        setIsReassignModalOpen(true);
        // Đặt targetPeriodId thành null vì người dùng chưa chọn thời kỳ đích
        setTargetPeriodId(null);
        return;
      }

      // Nếu xóa thành công, hiển thị thông báo và cập nhật UI
      if (res.ok) {
        toast({
          title: 'Thành công',
          description: 'Xóa thời kỳ thành công',
        });
        setIsConfirmDeleteOpen(false);
        setDeletingPeriodId(null);
        refetch();
        return;
      }
      
      // Nếu lỗi khác, hiển thị thông báo lỗi
      toast({
        title: 'Lỗi',
        description: data.message || 'Lỗi khi xóa thời kỳ',
        variant: 'destructive',
      });
      setIsConfirmDeleteOpen(false);
      
    } catch (error) {
      console.error('Error deleting period:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi xóa thời kỳ',
        variant: 'destructive',
      });
      setIsConfirmDeleteOpen(false);
    }
  };

  // Hàm xử lý việc gán lại hoặc xóa các mục liên kết
  const handleReassignOrDelete = async (action: 'reassign' | 'delete') => {
    if (!relatedItemsData || !deletingPeriodId) return;
    
    setReassignLoading(true);
    
    try {
      // API endpoint và body sẽ phụ thuộc vào hành động
      const endpoint = action === 'reassign' 
        ? `/api/admin/periods/${deletingPeriodId}/reassign`
        : `/api/admin/periods/${deletingPeriodId}/delete-content`;
      
      const body = action === 'reassign' 
        ? { targetPeriodId } 
        : {};
      
      const res = await apiRequest('POST', endpoint, body);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Lỗi khi ${action === 'reassign' ? 'chuyển' : 'xóa'} nội dung`);
      }
      
      // Sau khi xử lý xong các mục liên kết, xóa thời kỳ
      await apiRequest('DELETE', `/api/admin/periods/${deletingPeriodId}`);
      
      toast({
        title: 'Thành công',
        description: `Đã ${action === 'reassign' ? 'chuyển' : 'xóa'} nội dung và xóa thời kỳ thành công`,
      });
      
      // Đóng modal và cập nhật lại danh sách
      setIsReassignModalOpen(false);
      setRelatedItemsData(null);
      setDeletingPeriodId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || `Có lỗi xảy ra khi ${action === 'reassign' ? 'chuyển' : 'xóa'} nội dung`,
        variant: 'destructive',
      });
    } finally {
      setReassignLoading(false);
    }
  };

  // Cấu hình các sensors cho DnD-Kit
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Khuếch đại kéo thả để tránh nhấp lộn với click thường
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Để tránh kích hoạt khi cuộn trang
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Component con hiển thị một thời kỳ có thể kéo thả
  const SortablePeriodItem = ({ period }: { period: Period }) => {
    const {
      attributes,
      listeners, 
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging
    } = useSortable({ id: period.id.toString() });

    const itemStyle = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      zIndex: isItemDragging ? 50 : 1,
    };

    return (
      <div ref={setNodeRef} style={itemStyle} className="mb-2">
        <Card className={`overflow-hidden ${isItemDragging ? 'shadow-lg ring-2 ring-primary' : ''} w-full`}>
          <div className="p-3 flex items-center gap-3 bg-blue-50 border-b">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">{period.name}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <Clock className="h-4 w-4 mr-1" />
                {period.timeframe}
              </div>
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
          <div className="p-3 text-sm">
            <p className="text-gray-600 line-clamp-2">{period.description}</p>
          </div>
        </Card>
      </div>
    );
  };

  // Xử lý sự kiện kéo thả hoàn tất với DnD-Kit
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    setPeriodsState((items) => {
      const oldIndex = items.findIndex(item => item.id.toString() === active.id);
      const newIndex = items.findIndex(item => item.id.toString() === over.id);
      
      const updatedPeriods = arrayMove(items, oldIndex, newIndex);
      
      try {
        // Gửi yêu cầu cập nhật thứ tự lên server
        const periodIds = updatedPeriods.map(period => period.id);
        console.log('Danh sách ID thời kỳ mới:', periodIds);
        
        // Gọi API mới - chỉ cần truyền mảng ID trực tiếp
        reorderMutation.mutate(periodIds);
      } catch (err) {
        console.error('Lỗi khi chuẩn bị dữ liệu reorder:', err);
        setError({
          title: 'Lỗi kéo thả',
          message: 'Có lỗi xảy ra khi chuẩn bị dữ liệu. Vui lòng thử lại.',
        });
      }
      
      return updatedPeriods;
    });
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
              <div className="bg-blue-50 p-3 mb-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-800">Hướng dẫn:</span>
                </div>
                <p className="text-gray-700 mt-1">
                  Kéo và thả các thẻ để thay đổi thứ tự hiển thị thời kỳ. Thay đổi sẽ được áp dụng trên trang chủ và các danh sách.
                </p>
              </div>
              
              <DndContext 
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext 
                  items={periodsState.map(period => period.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col w-full">
                    {periodsState.map((period) => (
                      <SortablePeriodItem key={period.id} period={period} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
              Lưu ý: Thời kỳ có sự kiện hoặc địa danh liên kết sẽ được hiển thị để xử lý.
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
      
      {/* Modal xử lý các mục liên kết */}
      <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Xử lý nội dung liên kết</DialogTitle>
            <DialogDescription>
              {relatedItemsData && (
                <span>
                  Thời kỳ <span className="font-medium">{relatedItemsData.periodName}</span> có các mục liên kết.
                  Vui lòng chọn cách xử lý trước khi xóa.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {relatedItemsData && (
            <div className="grid gap-4 py-4">
              {/* Tab để hiển thị sự kiện và di tích */}
              <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="events" className="flex items-center">
                    <span className="ml-2">Sự kiện ({relatedItemsData.events.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="figures" className="flex items-center">
                    <span className="ml-2">Nhân vật ({relatedItemsData.figures.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="sites" className="flex items-center">
                    <span className="ml-2">Di tích ({relatedItemsData.sites.length})</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="mt-4">
                  {relatedItemsData.events.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <div className="p-3 bg-muted">
                        <h4 className="font-medium">Danh sách sự kiện</h4>
                      </div>
                      <div className="divide-y">
                        {relatedItemsData.events.map((event) => (
                          <div key={event.id} className="p-3 hover:bg-muted/50">
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{event.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có sự kiện nào liên kết với thời kỳ này
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="figures" className="mt-4">
                  {relatedItemsData.figures.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <div className="p-3 bg-muted">
                        <h4 className="font-medium">Danh sách nhân vật lịch sử</h4>
                      </div>
                      <div className="divide-y">
                        {relatedItemsData.figures.map((figure) => (
                          <div key={figure.id} className="p-3 hover:bg-muted/50">
                            <div className="font-medium">{figure.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">{figure.lifespan}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có nhân vật nào liên kết với thời kỳ này
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sites" className="mt-4">
                  {relatedItemsData.sites.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <div className="p-3 bg-muted">
                        <h4 className="font-medium">Danh sách di tích</h4>
                      </div>
                      <div className="divide-y">
                        {relatedItemsData.sites.map((site) => (
                          <div key={site.id} className="p-3 hover:bg-muted/50">
                            <div className="font-medium">{site.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">{site.location}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có di tích nào liên kết với thời kỳ này
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Phần lựa chọn cách xử lý */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroup value={reassignOption} onValueChange={(val: 'reassign' | 'delete') => setReassignOption(val)}>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="reassign" id="reassign" />
                      <Label htmlFor="reassign">Chuyển sang thời kỳ khác</Label>
                    </div>
                    
                    {reassignOption === 'reassign' && relatedItemsData.availablePeriods.length > 0 && (
                      <div className="ml-6 mb-3">
                        <Label htmlFor="targetPeriod" className="block mb-2">
                          Chọn thời kỳ để chuyển nội dung đến:
                        </Label>
                        <Select value={targetPeriodId?.toString() || ''} onValueChange={(value) => setTargetPeriodId(parseInt(value))}>
                          <SelectTrigger id="targetPeriod">
                            <SelectValue placeholder="Chọn thời kỳ đích" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedItemsData.availablePeriods.map((period) => (
                              <SelectItem key={period.id} value={period.id.toString()}>
                                {period.name} ({period.timeframe})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delete" id="delete" />
                      <Label htmlFor="delete">Xóa tất cả các mục liên kết</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Lựa chọn của bạn:</p>
                    <p className="mt-1 text-amber-700 text-sm">
                      1. <strong>Chuyển nội dung:</strong> Chọn thời kỳ đích và nhấn "Chuyển nội dung" để di chuyển các mục đến thời kỳ khác.
                    </p>
                    <p className="mt-1 text-amber-700 text-sm">
                      2. <strong>Xóa hết:</strong> Xóa tất cả các sự kiện và di tích liên kết, rồi xóa thời kỳ. Lưu ý: Hành động này không thể hoàn tác!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignModalOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleReassignOrDelete('reassign')} 
              disabled={reassignLoading || !targetPeriodId}
              className="mr-2"
            >
              {reassignLoading ? 'Đang xử lý...' : 'Chuyển nội dung'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleReassignOrDelete('delete')} 
              disabled={reassignLoading}
            >
              {reassignLoading ? 'Đang xử lý...' : 'Xóa hết'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

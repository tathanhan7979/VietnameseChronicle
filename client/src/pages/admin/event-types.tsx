import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Tag, Edit, MoreHorizontal, Plus, Trash, GripVertical, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToastError } from '@/components/ui/toast-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext, 
  MouseSensor, 
  TouchSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  useSortable, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Định nghĩa schema cho form
const eventTypeFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên loại sự kiện'),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã màu không hợp lệ').default('#3B82F6'),
  slug: z.string().optional(),
});

type EventTypeFormValues = z.infer<typeof eventTypeFormSchema>;

interface EventType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
}

export default function EventTypesAdmin() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingEventTypeId, setDeletingEventTypeId] = useState<number | null>(null);
  const [eventTypesState, setEventTypesState] = useState<EventType[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<{title: string; message: string; status?: number} | null>(null);

  // Lấy danh sách các loại sự kiện
  const { data: eventTypes, isLoading, refetch } = useQuery<EventType[]>({
    queryKey: ['/api/admin/event-types'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Cập nhật state eventTypesState khi eventTypes thay đổi
  useEffect(() => {
    if (eventTypes) {
      setEventTypesState([...eventTypes].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [eventTypes]);

  // Form tạo mới
  const createForm = useForm<EventTypeFormValues>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      slug: '',
    },
  });

  // Form chỉnh sửa
  const editForm = useForm<EventTypeFormValues>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      slug: '',
    },
  });

  // Tạo loại sự kiện mới
  const createMutation = useMutation({
    mutationFn: async (data: EventTypeFormValues) => {
      const res = await apiRequest('POST', '/api/admin/event-types', data);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi tạo loại sự kiện');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Thêm loại sự kiện mới thành công',
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

  // Cập nhật loại sự kiện
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EventTypeFormValues }) => {
      const res = await apiRequest('PUT', `/api/admin/event-types/${id}`, data);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi cập nhật loại sự kiện');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Cập nhật loại sự kiện thành công',
      });
      setIsEditDialogOpen(false);
      setEditingEventType(null);
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

  // Xóa loại sự kiện
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/event-types/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Lỗi khi xóa loại sự kiện');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Xóa loại sự kiện thành công',
      });
      setIsConfirmDeleteOpen(false);
      setDeletingEventTypeId(null);
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

  // Sắp xếp thứ tự loại sự kiện
  const reorderMutation = useMutation({
    mutationFn: async (idsArray: number[]) => {
      try {
        setError(null);
        
        if (!Array.isArray(idsArray) || idsArray.length === 0) {
          throw new Error('Danh sách ID không hợp lệ');
        }
        
        const numericIds = idsArray.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        
        const res = await apiRequest('PUT', '/api/admin/event-types/reorder', { orderedIds: numericIds });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi khi sắp xếp thứ tự');
        }
        
        return await res.json();
      } catch (error: any) {
        console.error('Lỗi khi gọi API reorder:', error);
        setError({
          title: 'Không thể sắp xếp loại sự kiện',
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
      console.error('Mutation error:', error);
    },
  });

  const onCreateSubmit = (values: EventTypeFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: EventTypeFormValues) => {
    if (!editingEventType) return;
    updateMutation.mutate({ id: editingEventType.id, data: values });
  };

  const handleEditEventType = (eventType: EventType) => {
    setEditingEventType(eventType);
    editForm.reset({
      name: eventType.name,
      description: eventType.description || '',
      color: eventType.color,
      slug: eventType.slug,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteEventType = (id: number) => {
    setDeletingEventTypeId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEventTypeId) return;

    try {
      const res = await apiRequest('DELETE', `/api/admin/event-types/${deletingEventTypeId}`);
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Thành công',
          description: 'Xóa loại sự kiện thành công',
        });
        setIsConfirmDeleteOpen(false);
        setDeletingEventTypeId(null);
        refetch();
        return;
      }
      
      toast({
        title: 'Lỗi',
        description: data.message || 'Lỗi khi xóa loại sự kiện',
        variant: 'destructive',
      });
      setIsConfirmDeleteOpen(false);
      
    } catch (error) {
      console.error('Error deleting event type:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi xóa loại sự kiện',
        variant: 'destructive',
      });
      setIsConfirmDeleteOpen(false);
    }
  };

  // Cấu hình các sensors cho DnD-Kit
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Component con hiển thị một loại sự kiện có thể kéo thả
  const SortableEventTypeItem = ({ eventType }: { eventType: EventType }) => {
    const {
      attributes,
      listeners, 
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging
    } = useSortable({ id: eventType.id.toString() });

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
            
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: eventType.color || '#3B82F6' }}
              ></div>
              <h3 className="text-lg font-medium text-blue-900">{eventType.name}</h3>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a 
                    href={`/event-types/${eventType.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditEventType(eventType)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteEventType(eventType.id)}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {eventType.description && (
            <div className="p-3 text-sm">
              <p className="text-gray-600 line-clamp-2">{eventType.description}</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Xử lý sự kiện kéo thả hoàn tất với DnD-Kit
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    setEventTypesState((items) => {
      const oldIndex = items.findIndex(item => item.id.toString() === active.id);
      const newIndex = items.findIndex(item => item.id.toString() === over.id);
      
      const updatedEventTypes = arrayMove(items, oldIndex, newIndex);
      
      try {
        // Gửi yêu cầu cập nhật thứ tự lên server
        const eventTypeIds = updatedEventTypes.map(eventType => eventType.id);
        
        // Gọi API cập nhật thứ tự
        reorderMutation.mutate(eventTypeIds);
      } catch (err) {
        console.error('Lỗi khi chuẩn bị dữ liệu reorder:', err);
        setError({
          title: 'Lỗi kéo thả',
          message: 'Có lỗi xảy ra khi chuẩn bị dữ liệu. Vui lòng thử lại.',
        });
      }
      
      return updatedEventTypes;
    });
  };
  
  // Bắt đầu kéo thả
  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <AdminLayout title="Quản lý loại sự kiện">
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
          <h2 className="text-2xl font-bold">Danh sách loại sự kiện</h2>
          <p className="text-gray-500">
            Quản lý các loại sự kiện trong hệ thống
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm loại sự kiện
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {(!eventTypesState || eventTypesState.length === 0) ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <Tag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                Chưa có loại sự kiện nào
              </h3>
              <p className="text-gray-500 mb-4">
                Bắt đầu bằng cách thêm loại sự kiện đầu tiên.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm loại sự kiện mới
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
                  Kéo và thả các thẻ để thay đổi thứ tự hiển thị loại sự kiện. Thay đổi sẽ được áp dụng trên trang chủ và các danh sách.
                </p>
              </div>
              
              <DndContext 
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext 
                  items={eventTypesState.map(eventType => eventType.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col w-full">
                    {eventTypesState.map((eventType) => (
                      <SortableEventTypeItem key={eventType.id} eventType={eventType} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </>
      )}

      {/* Tạo loại sự kiện mới */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Thêm loại sự kiện mới</DialogTitle>
            <DialogDescription>
              Điền thông tin về loại sự kiện mới.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên loại sự kiện</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên loại sự kiện" {...field} />
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
                        placeholder="Nhập mô tả về loại sự kiện này" 
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu sắc</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-9 p-1" />
                      </FormControl>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang xử lý...' : 'Thêm loại sự kiện'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Chỉnh sửa loại sự kiện */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa loại sự kiện</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin về loại sự kiện.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên loại sự kiện</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên loại sự kiện" {...field} />
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
                        placeholder="Nhập mô tả về loại sự kiện này" 
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu sắc</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-9 p-1" />
                      </FormControl>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
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
              Bạn có chắc chắn muốn xóa loại sự kiện này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xử lý...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
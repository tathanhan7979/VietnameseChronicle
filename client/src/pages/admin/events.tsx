import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { LayoutList, Edit, MoreHorizontal, Plus, Trash, GripVertical, Upload, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToastError } from '@/components/ui/toast-error';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Định nghĩa schema cho form sự kiện
const eventFormSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề sự kiện'),
  year: z.string().min(1, 'Vui lòng nhập năm/thời gian'),
  description: z.string().min(1, 'Vui lòng nhập mô tả ngắn'),
  detailedDescription: z.string().optional(),
  periodId: z.string().or(z.number()).refine(val => !!val, 'Vui lòng chọn thời kỳ'),
  eventTypes: z.array(z.string().or(z.number())).optional(),
  imageUrl: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface Event {
  id: number;
  title: string;
  year: string;
  description: string;
  detailedDescription?: string;
  periodId: number;
  imageUrl?: string;
  sortOrder: number;
  eventTypes?: EventType[];
}

interface EventType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
}

interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  sortOrder: number;
}

export default function EventsAdmin() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [eventsState, setEventsState] = useState<Event[]>([]);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlValue, setImageUrlValue] = useState<string>('');
  const [selectedPeriodTab, setSelectedPeriodTab] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<{title: string; message: string; status?: number} | null>(null);

  // Lấy danh sách các sự kiện
  const { data: events, isLoading: isEventsLoading, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Lấy danh sách các thời kỳ
  const { data: periods, isLoading: isPeriodsLoading } = useQuery<Period[]>({
    queryKey: ['/api/admin/periods'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Lấy danh sách các loại sự kiện
  const { data: eventTypes, isLoading: isEventTypesLoading } = useQuery<EventType[]>({
    queryKey: ['/api/admin/event-types'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Cập nhật state eventsState khi events thay đổi
  useEffect(() => {
    if (events) {
      const sortedEvents = [...events].sort((a, b) => a.sortOrder - b.sortOrder);
      setEventsState(sortedEvents);
      
      // Nếu chưa có tab nào được chọn và có dữ liệu thời kỳ, chọn tab đầu tiên
      if (!selectedPeriodTab && periods && periods.length > 0) {
        setSelectedPeriodTab(periods[0].id.toString());
      }
    }
  }, [events, periods, selectedPeriodTab]);

  // Form tạo mới
  const createForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      year: '',
      description: '',
      detailedDescription: '',
      periodId: '',
      eventTypes: [],
      imageUrl: '',
    },
  });

  // Form chỉnh sửa
  const editForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      year: '',
      description: '',
      detailedDescription: '',
      periodId: '',
      eventTypes: [],
      imageUrl: '',
    },
  });

  // Reset form khi đóng dialog
  useEffect(() => {
    if (!isCreateDialogOpen) {
      createForm.reset();
      setImageUploadMode('url');
      setUploadedImage(null);
      setImagePreview(null);
      setImageUrlValue('');
    }
  }, [isCreateDialogOpen, createForm]);

  useEffect(() => {
    if (!isEditDialogOpen) {
      editForm.reset();
      setImageUploadMode('url');
      setUploadedImage(null);
      setImagePreview(null);
      setImageUrlValue('');
    }
  }, [isEditDialogOpen, editForm]);

  // Tạo sự kiện mới
  const createMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      // Xử lý tải lên hình ảnh nếu có
      let finalData = { ...data };
      
      if (imageUploadMode === 'upload' && uploadedImage) {
        // Convert file to base64 for the API request
        const base64 = await convertFileToBase64(uploadedImage);
        finalData.imageUrl = base64;
      }
      
      const res = await apiRequest('POST', '/api/admin/events', finalData);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi tạo sự kiện');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Thêm sự kiện mới thành công',
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setImageUploadMode('url');
      setUploadedImage(null);
      setImagePreview(null);
      refetchEvents();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cập nhật sự kiện
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EventFormValues }) => {
      // Xử lý tải lên hình ảnh nếu có
      let finalData = { ...data };
      
      if (imageUploadMode === 'upload' && uploadedImage) {
        // Convert file to base64 for the API request
        const base64 = await convertFileToBase64(uploadedImage);
        finalData.imageUrl = base64;
      }
      
      const res = await apiRequest('PUT', `/api/admin/events/${id}`, finalData);
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi cập nhật sự kiện');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Cập nhật sự kiện thành công',
      });
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      editForm.reset();
      setImageUploadMode('url');
      setUploadedImage(null);
      setImagePreview(null);
      refetchEvents();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Xóa sự kiện
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/events/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Lỗi khi xóa sự kiện');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Xóa sự kiện thành công',
      });
      setIsConfirmDeleteOpen(false);
      setDeletingEventId(null);
      refetchEvents();
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

  // Sắp xếp thứ tự sự kiện
  const reorderMutation = useMutation({
    mutationFn: async (idsArray: number[]) => {
      try {
        setError(null);
        
        if (!Array.isArray(idsArray) || idsArray.length === 0) {
          throw new Error('Danh sách ID không hợp lệ');
        }
        
        const numericIds = idsArray.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        
        const res = await apiRequest('POST', '/api/admin/events/reorder', { orderedIds: numericIds });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi khi sắp xếp thứ tự');
        }
        
        return await res.json();
      } catch (error: any) {
        console.error('Lỗi khi gọi API reorder:', error);
        setError({
          title: 'Không thể sắp xếp sự kiện',
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
      refetchEvents();
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
    },
  });

  const onCreateSubmit = (values: EventFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: EventFormValues) => {
    if (!editingEvent) return;
    updateMutation.mutate({ id: editingEvent.id, data: values });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    editForm.reset({
      title: event.title,
      year: event.year,
      description: event.description,
      detailedDescription: event.detailedDescription || '',
      periodId: event.periodId.toString(),
      // Chuyển đổi mảng loại sự kiện thành mảng ID
      eventTypes: event.eventTypes ? event.eventTypes.map(et => et.id.toString()) : [],
      imageUrl: event.imageUrl || '',
    });
    setImageUrlValue(event.imageUrl || '');
    if (event.imageUrl) {
      setImagePreview(event.imageUrl);
    }
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = (id: number) => {
    setDeletingEventId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEventId) return;
    deleteMutation.mutate(deletingEventId);
  };

  // Hàm chuyển đổi File thành base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Xử lý thay đổi chế độ tải lên hình ảnh
  const handleImageModeChange = (mode: 'url' | 'upload') => {
    setImageUploadMode(mode);
    if (mode === 'url') {
      setUploadedImage(null);
      // Khôi phục giá trị URL từ form
      const currentForm = isEditDialogOpen ? editForm : createForm;
      const currentUrl = currentForm.getValues('imageUrl') || '';
      setImagePreview(currentUrl);
      setImageUrlValue(currentUrl);
    } else {
      // Chuyển sang chế độ upload, xóa URL
      setImagePreview(null);
    }
  };

  // Xử lý khi người dùng chọn tệp hình ảnh
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedImage(file);
      
      // Tạo URL tạm thời để hiển thị xem trước
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Cập nhật giá trị imageUrl trong form
      const currentForm = isEditDialogOpen ? editForm : createForm;
      currentForm.setValue('imageUrl', 'uploaded_file'); // Giá trị tạm thời
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Xử lý khi người dùng nhập URL hình ảnh
  const handleImageUrlChange = (url: string) => {
    setImageUrlValue(url);
    setImagePreview(url);
    
    // Cập nhật giá trị imageUrl trong form
    const currentForm = isEditDialogOpen ? editForm : createForm;
    currentForm.setValue('imageUrl', url);
  };

  // Xóa hình ảnh
  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImage(null);
    setImageUrlValue('');
    
    // Cập nhật giá trị imageUrl trong form
    const currentForm = isEditDialogOpen ? editForm : createForm;
    currentForm.setValue('imageUrl', '');
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

  // Component con hiển thị một sự kiện có thể kéo thả
  const SortableEventItem = ({ event }: { event: Event }) => {
    const {
      attributes,
      listeners, 
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging
    } = useSortable({ id: event.id.toString() });

    const itemStyle = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      zIndex: isItemDragging ? 50 : 1,
    };

    // Lấy thông tin thời kỳ của sự kiện
    const periodInfo = periods?.find(p => p.id === event.periodId);

    return (
      <div ref={setNodeRef} style={itemStyle} className="mb-2">
        <Card className={`overflow-hidden ${isItemDragging ? 'shadow-lg ring-2 ring-primary' : ''} w-full`}>
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="w-full sm:w-48 h-40 bg-gray-100 relative flex-shrink-0">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image size={32} />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium line-clamp-1">{event.title}</h3>
                  <div className="text-sm text-gray-500 flex items-center mt-1 space-x-2">
                    <span key="year">{event.year}</span>
                    {periodInfo && (
                      <>
                        <span key="bullet">•</span>
                        <span key="period-name">{periodInfo.name}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Event Types */}
                  {event.eventTypes && event.eventTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.eventTypes.map(type => (
                        <span 
                          key={type.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${type.color}20`, 
                            color: type.color,
                            borderColor: type.color,
                            borderWidth: '1px'
                          }}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {event.description}
              </p>
            </div>
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
    
    setEventsState((items) => {
      const oldIndex = items.findIndex(item => item.id.toString() === active.id);
      const newIndex = items.findIndex(item => item.id.toString() === over.id);
      
      const updatedEvents = arrayMove(items, oldIndex, newIndex);
      
      try {
        // Gửi yêu cầu cập nhật thứ tự lên server
        const eventIds = updatedEvents.map(event => event.id);
        
        // Gọi API cập nhật thứ tự
        reorderMutation.mutate(eventIds);
      } catch (err) {
        console.error('Lỗi khi chuẩn bị dữ liệu reorder:', err);
        setError({
          title: 'Lỗi kéo thả',
          message: 'Có lỗi xảy ra khi chuẩn bị dữ liệu. Vui lòng thử lại.',
        });
      }
      
      return updatedEvents;
    });
  };
  
  // Bắt đầu kéo thả
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Lọc sự kiện theo thời kỳ đã chọn
  const filteredEvents = selectedPeriodTab
    ? eventsState.filter(event => event.periodId.toString() === selectedPeriodTab)
    : eventsState;

  // Thời kỳ được chọn hiện tại
  const selectedPeriod = periods?.find(p => p.id.toString() === selectedPeriodTab);

  // React Quill modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'align'
  ];

  // Loading chung
  const isLoading = isEventsLoading || isPeriodsLoading || isEventTypesLoading;

  return (
    <AdminLayout title="Quản lý sự kiện lịch sử">
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
          <h2 className="text-2xl font-bold">Danh sách sự kiện</h2>
          <p className="text-gray-500">
            Quản lý các sự kiện lịch sử phân chia theo thời kỳ
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sự kiện mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {(!periods || periods.length === 0) ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Chưa có thời kỳ lịch sử</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Bạn cần tạo ít nhất một thời kỳ lịch sử trước khi thêm sự kiện. <Link href="/admin/periods" className="font-medium underline">Tạo thời kỳ</Link></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Danh sách thời kỳ theo cột dọc */}
              <div className="md:col-span-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Danh sách thời kỳ</h3>
                <div className="space-y-2">
                  {periods.map(period => (
                    <div 
                      key={period.id}
                      onClick={() => setSelectedPeriodTab(period.id.toString())}
                      className={`p-2 rounded cursor-pointer transition-colors ${selectedPeriodTab === period.id.toString() 
                        ? 'bg-blue-100 text-blue-800 font-medium' 
                        : 'hover:bg-gray-100'}`}
                    >
                      {period.name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Nội dung sự kiện */}
              <div className="md:col-span-3">
                {selectedPeriodTab && selectedPeriod ? (
                  <div>
                    <div className="bg-blue-50 p-3 mb-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-blue-800">Hướng dẫn:</span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        Kéo và thả các thẻ để thay đổi thứ tự hiển thị sự kiện trong thời kỳ "{selectedPeriod.name}". Thay đổi sẽ được áp dụng trên trang chi tiết thời kỳ và timeline.
                      </p>
                    </div>
                    
                    {filteredEvents.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <LayoutList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">
                          Chưa có sự kiện nào trong thời kỳ này
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Bắt đầu bằng cách thêm sự kiện đầu tiên cho thời kỳ {selectedPeriod.name}.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Thêm sự kiện mới
                        </Button>
                      </div>
                    ) : (
                      <DndContext 
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext 
                          items={filteredEvents.map(event => event.id.toString())}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex flex-col w-full">
                            {filteredEvents.map((event) => (
                              <SortableEventItem key={event.id} event={event} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-600 mb-1">
                      Vui lòng chọn một thời kỳ từ danh sách bên trái
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tạo sự kiện mới */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm sự kiện mới</DialogTitle>
            <DialogDescription>
              Điền thông tin về sự kiện lịch sử mới.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề sự kiện</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề sự kiện" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm/Thời gian</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: 1258, 1010-1020, Thế kỷ 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời kỳ</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods?.map(period => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Loại sự kiện</Label>
                <div className="mt-2 border rounded-md p-3">
                  {eventTypes?.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có loại sự kiện nào. Vui lòng tạo loại sự kiện trước.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={createForm.control}
                        name="eventTypes"
                        render={() => (
                          <>
                            {eventTypes?.map((type) => (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 hover:bg-gray-50"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={createForm.watch('eventTypes')?.includes(type.id.toString())}
                                    onCheckedChange={(checked) => {
                                      const current = createForm.getValues('eventTypes') || [];
                                      const updated = checked
                                        ? [...current, type.id.toString()]
                                        : current.filter(id => id !== type.id.toString());
                                      createForm.setValue('eventTypes', updated, { 
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                  />
                                </FormControl>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: type.color || '#3B82F6' }}
                                  ></div>
                                  <FormLabel className="font-normal text-sm cursor-pointer">
                                    {type.name}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập mô tả ngắn về sự kiện" 
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
                name="detailedDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung chi tiết</FormLabel>
                    <FormControl>
                      <div className="border rounded-md">
                        <Controller
                          name="detailedDescription"
                          control={createForm.control}
                          render={({ field }) => (
                            <ReactQuill
                              theme="snow"
                              modules={quillModules}
                              formats={quillFormats}
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh</FormLabel>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Button 
                          type="button" 
                          variant={imageUploadMode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleImageModeChange('url')}
                        >
                          URL
                        </Button>
                        <Button 
                          type="button" 
                          variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleImageModeChange('upload')}
                        >
                          Tải lên
                        </Button>
                      </div>
                      
                      {imageUploadMode === 'url' ? (
                        <div className="flex">
                          <FormControl>
                            <Input 
                              placeholder="Nhập URL hình ảnh" 
                              value={imageUrlValue}
                              onChange={(e) => handleImageUrlChange(e.target.value)}
                            />
                          </FormControl>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                          />
                          <p className="text-xs text-gray-500">
                            Định dạng hỗ trợ: JPEG, PNG, WebP. Kích thước tối đa: 5MB.
                          </p>
                        </div>
                      )}
                      
                      {imagePreview && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <Button 
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
                  {createMutation.isPending ? 'Đang xử lý...' : 'Thêm sự kiện'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Chỉnh sửa sự kiện */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin về sự kiện lịch sử.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề sự kiện</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề sự kiện" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm/Thời gian</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: 1258, 1010-1020, Thế kỷ 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời kỳ</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods?.map(period => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Loại sự kiện</Label>
                <div className="mt-2 border rounded-md p-3">
                  {eventTypes?.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có loại sự kiện nào. Vui lòng tạo loại sự kiện trước.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={editForm.control}
                        name="eventTypes"
                        render={() => (
                          <>
                            {eventTypes?.map((type) => (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 hover:bg-gray-50"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={editForm.watch('eventTypes')?.includes(type.id.toString())}
                                    onCheckedChange={(checked) => {
                                      const current = editForm.getValues('eventTypes') || [];
                                      const updated = checked
                                        ? [...current, type.id.toString()]
                                        : current.filter(id => id !== type.id.toString());
                                      editForm.setValue('eventTypes', updated, { 
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                  />
                                </FormControl>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: type.color || '#3B82F6' }}
                                  ></div>
                                  <FormLabel className="font-normal text-sm cursor-pointer">
                                    {type.name}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập mô tả ngắn về sự kiện" 
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
                name="detailedDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung chi tiết</FormLabel>
                    <FormControl>
                      <div className="border rounded-md">
                        <Controller
                          name="detailedDescription"
                          control={editForm.control}
                          render={({ field }) => (
                            <ReactQuill
                              theme="snow"
                              modules={quillModules}
                              formats={quillFormats}
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh</FormLabel>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Button 
                          type="button" 
                          variant={imageUploadMode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleImageModeChange('url')}
                        >
                          URL
                        </Button>
                        <Button 
                          type="button" 
                          variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleImageModeChange('upload')}
                        >
                          Tải lên
                        </Button>
                      </div>
                      
                      {imageUploadMode === 'url' ? (
                        <div className="flex">
                          <FormControl>
                            <Input 
                              placeholder="Nhập URL hình ảnh" 
                              value={imageUrlValue}
                              onChange={(e) => handleImageUrlChange(e.target.value)}
                            />
                          </FormControl>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                          />
                          <p className="text-xs text-gray-500">
                            Định dạng hỗ trợ: JPEG, PNG, WebP. Kích thước tối đa: 5MB.
                          </p>
                        </div>
                      )}
                      
                      {imagePreview && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <Button 
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
              Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác.
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
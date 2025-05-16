import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SelectItem, Select, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, PenLine, Plus, Search, Trash2, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schema cho form tin tức
const newsFormSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề không được để trống' }),
  content: z.string().min(1, { message: 'Nội dung không được để trống' }),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
  eventTypeId: z.string().optional(),
  periodId: z.string().optional(),
  eventId: z.string().optional(),
  historicalFigureId: z.string().optional(),
  historicalSiteId: z.string().optional(),
  published: z.boolean().default(true),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

// Hiển thị thời gian định dạng Việt Nam
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form cho thêm tin tức mới
  const addForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      imageUrl: '',
      eventTypeId: '',
      periodId: '',
      eventId: '',
      historicalFigureId: '',
      historicalSiteId: '',
      published: true,
    },
  });

  // Form cho chỉnh sửa tin tức
  const editForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      imageUrl: '',
      eventTypeId: '',
      periodId: '',
      eventId: '',
      historicalFigureId: '',
      historicalSiteId: '',
      published: true,
    },
  });

  // Query lấy danh sách tin tức
  const { data: newsData, isLoading: isLoadingNews } = useQuery<any[]>({
    queryKey: ['/api/admin/news'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/news');
      const data = await response.json();
      return data;
    },
  });

  // Query lấy danh sách loại sự kiện
  const { data: eventTypes, isLoading: isLoadingEventTypes } = useQuery<any[]>({
    queryKey: ['/api/admin/event-types'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/event-types');
      const data = await response.json();
      return data;
    },
  });

  // Query lấy danh sách thời kỳ
  const { data: periods, isLoading: isLoadingPeriods } = useQuery<any[]>({
    queryKey: ['/api/admin/periods'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/periods');
      const data = await response.json();
      return data;
    },
  });

  // Query lấy danh sách sự kiện
  const { data: events, isLoading: isLoadingEvents } = useQuery<any[]>({
    queryKey: ['/api/admin/events'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/events');
      const data = await response.json();
      return data;
    },
  });

  // Query lấy danh sách nhân vật lịch sử
  const { data: historicalFigures, isLoading: isLoadingFigures } = useQuery<any[]>({
    queryKey: ['/api/admin/historical-figures'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/historical-figures');
      const data = await response.json();
      return data;
    },
  });

  // Query lấy danh sách di tích lịch sử
  const { data: historicalSites, isLoading: isLoadingSites } = useQuery<any[]>({
    queryKey: ['/api/admin/historical-sites'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/historical-sites');
      const data = await response.json();
      return data;
    },
  });

  // Lấy thông tin chi tiết của tin tức cần chỉnh sửa
  const { data: selectedNews, isLoading: isLoadingSelectedNews } = useQuery<any>({
    queryKey: ['/api/admin/news', selectedNewsId],
    queryFn: async () => {
      if (!selectedNewsId) return null;
      const response = await apiRequest('GET', `/api/admin/news/${selectedNewsId}`);
      const data = await response.json();
      return data;
    },
    enabled: !!selectedNewsId,
  });

  // Mutation thêm tin tức mới
  const addNewsMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      const formData = new FormData();
      
      // Thêm các trường dữ liệu vào FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Thêm file ảnh nếu có
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await apiRequest('POST', '/api/admin/news', null, { body: formData, isFormData: true });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      toast({
        title: 'Thành công',
        description: 'Đã thêm tin tức mới',
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      setImageFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể thêm tin tức: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation cập nhật tin tức
  const updateNewsMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      const formData = new FormData();
      
      // Thêm các trường dữ liệu vào FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Thêm file ảnh nếu có
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await apiRequest('PUT', `/api/admin/news/${selectedNewsId}`, null, { body: formData, isFormData: true });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật tin tức',
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedNewsId(null);
      setImageFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể cập nhật tin tức: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation xóa tin tức
  const deleteNewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/admin/news/${selectedNewsId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      toast({
        title: 'Thành công',
        description: 'Đã xóa tin tức',
      });
      setIsDeleteDialogOpen(false);
      setSelectedNewsId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể xóa tin tức: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Upload ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Cập nhật trường imageUrl trong form với tên file để hiển thị
      if (formType === 'add') {
        addForm.setValue('imageUrl', file.name);
      } else {
        editForm.setValue('imageUrl', file.name);
      }
    }
  };

  // Mở form chỉnh sửa và điền thông tin
  const handleEditNews = (newsId: number) => {
    setSelectedNewsId(newsId);
    setIsEditDialogOpen(true);
  };

  // Điền thông tin vào form chỉnh sửa khi có dữ liệu
  React.useEffect(() => {
    if (selectedNews && isEditDialogOpen) {
      editForm.setValue('title', selectedNews.title);
      editForm.setValue('content', selectedNews.content);
      editForm.setValue('summary', selectedNews.summary || '');
      editForm.setValue('imageUrl', selectedNews.imageUrl || '');
      editForm.setValue('eventTypeId', selectedNews.eventTypeId ? String(selectedNews.eventTypeId) : '');
      editForm.setValue('periodId', selectedNews.periodId ? String(selectedNews.periodId) : '');
      editForm.setValue('eventId', selectedNews.eventId ? String(selectedNews.eventId) : '');
      editForm.setValue('historicalFigureId', selectedNews.historicalFigureId ? String(selectedNews.historicalFigureId) : '');
      editForm.setValue('historicalSiteId', selectedNews.historicalSiteId ? String(selectedNews.historicalSiteId) : '');
      editForm.setValue('published', selectedNews.published);
    }
  }, [selectedNews, isEditDialogOpen, editForm]);

  // Lọc tin tức theo từ khóa tìm kiếm
  const filteredNews = React.useMemo(() => {
    if (!newsData) return [];
    
    return newsData.filter(news => 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [newsData, searchQuery]);

  // Xử lý khi submit form thêm mới
  const onAddSubmit = (values: NewsFormValues) => {
    addNewsMutation.mutate(values);
  };

  // Xử lý khi submit form chỉnh sửa
  const onEditSubmit = (values: NewsFormValues) => {
    updateNewsMutation.mutate(values);
  };

  return (
    <AdminLayout title="Quản lý tin tức">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm tin tức..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm tin tức
          </Button>
        </div>

        {isLoadingNews ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((news) => (
              <Card key={news.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  {news.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/600x400?text=Không+có+ảnh';
                        }}
                      />
                    </div>
                  )}
                  {!news.imageUrl && (
                    <div className="h-40 bg-muted flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                    <Badge variant={news.published ? "default" : "outline"}>
                      {news.published ? "Đã đăng" : "Nháp"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ngày tạo: {formatDate(news.createdAt)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lượt xem: {news.viewCount || 0}
                  </div>
                  {news.summary && (
                    <p className="text-sm line-clamp-3">{news.summary}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNews(news.id)}
                  >
                    <PenLine className="h-4 w-4 mr-1" /> Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedNewsId(news.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Xóa
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {filteredNews.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                Không tìm thấy tin tức nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog thêm tin tức mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Thêm tin tức mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về tin tức mới.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-1">
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tiêu đề tin tức" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tóm tắt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập tóm tắt ngắn về tin tức"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Tóm tắt ngắn gọn về nội dung tin tức (không bắt buộc).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội dung chi tiết *</FormLabel>
                        <FormControl>
                          <RichTextEditor 
                            value={field.value} 
                            onChange={field.onChange}
                            placeholder="Nhập nội dung chi tiết của tin tức..." 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hình ảnh đại diện</FormLabel>
                          <div className="flex space-x-2">
                            <Input 
                              placeholder="URL hình ảnh hoặc tải lên" 
                              {...field} 
                              className="flex-1"
                            />
                            <label className="cursor-pointer">
                              <div className="px-3 h-10 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center text-sm font-medium">
                                Tải lên
                              </div>
                              <Input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'add')} 
                              />
                            </label>
                          </div>
                          <FormDescription>
                            Nhập URL hình ảnh hoặc tải lên từ máy tính.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="eventTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại sự kiện</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại sự kiện" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Không có</SelectItem>
                              {eventTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Loại sự kiện liên quan đến tin tức (không bắt buộc).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="periodId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời kỳ liên quan</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thời kỳ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Không có</SelectItem>
                              {periods?.map((period) => (
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

                    <FormField
                      control={addForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sự kiện liên quan</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn sự kiện" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Không có</SelectItem>
                              {events?.map((event) => (
                                <SelectItem key={event.id} value={event.id.toString()}>
                                  {event.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="historicalFigureId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhân vật lịch sử liên quan</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn nhân vật" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Không có</SelectItem>
                              {historicalFigures?.map((figure) => (
                                <SelectItem key={figure.id} value={figure.id.toString()}>
                                  {figure.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="historicalSiteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Di tích lịch sử liên quan</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn di tích" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Không có</SelectItem>
                              {historicalSites?.map((site) => (
                                <SelectItem key={site.id} value={site.id.toString()}>
                                  {site.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={addForm.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Trạng thái xuất bản</FormLabel>
                          <FormDescription>
                            Chọn trạng thái xuất bản cho tin tức này.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={addNewsMutation.isPending}>
                      {addNewsMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Thêm tin tức
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa tin tức */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tin tức</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết về tin tức.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingSelectedNews ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1 overflow-auto">
              <div className="p-1">
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiêu đề *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tiêu đề tin tức" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tóm tắt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Nhập tóm tắt ngắn về tin tức"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Tóm tắt ngắn gọn về nội dung tin tức (không bắt buộc).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nội dung chi tiết *</FormLabel>
                          <FormControl>
                            <RichTextEditor 
                              value={field.value} 
                              onChange={field.onChange}
                              placeholder="Nhập nội dung chi tiết của tin tức..." 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hình ảnh đại diện</FormLabel>
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="URL hình ảnh hoặc tải lên" 
                                {...field} 
                                className="flex-1"
                              />
                              <label className="cursor-pointer">
                                <div className="px-3 h-10 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center text-sm font-medium">
                                  Tải lên
                                </div>
                                <Input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'edit')} 
                                />
                              </label>
                            </div>
                            <FormDescription>
                              Nhập URL hình ảnh hoặc tải lên từ máy tính.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="eventTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loại sự kiện</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn loại sự kiện" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Không có</SelectItem>
                                {eventTypes?.map((type) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Loại sự kiện liên quan đến tin tức (không bắt buộc).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="periodId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời kỳ liên quan</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn thời kỳ" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Không có</SelectItem>
                                {periods?.map((period) => (
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

                      <FormField
                        control={editForm.control}
                        name="eventId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sự kiện liên quan</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn sự kiện" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Không có</SelectItem>
                                {events?.map((event) => (
                                  <SelectItem key={event.id} value={event.id.toString()}>
                                    {event.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="historicalFigureId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nhân vật lịch sử liên quan</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn nhân vật" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Không có</SelectItem>
                                {historicalFigures?.map((figure) => (
                                  <SelectItem key={figure.id} value={figure.id.toString()}>
                                    {figure.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="historicalSiteId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Di tích lịch sử liên quan</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn di tích" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Không có</SelectItem>
                                {historicalSites?.map((site) => (
                                  <SelectItem key={site.id} value={site.id.toString()}>
                                    {site.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={editForm.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Trạng thái xuất bản</FormLabel>
                            <FormDescription>
                              Chọn trạng thái xuất bản cho tin tức này.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={updateNewsMutation.isPending}>
                        {updateNewsMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Lưu thay đổi
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa tin tức */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tin tức này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteNewsMutation.mutate()}
              disabled={deleteNewsMutation.isPending}
            >
              {deleteNewsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
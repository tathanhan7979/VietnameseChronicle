import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Search, Edit, Plus, Eye, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { NewsPermissionField } from "./news-permission";

// Định nghĩa kiểu dữ liệu cho tin tức
interface News {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  period_id: number | null;
  event_id: number | null;
  figure_id: number | null;
  site_id: number | null;
  createdAt: string;
  updatedAt: string | null;
}

// Schema cho form tạo/cập nhật tin tức
const newsFormSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề không được để trống" }),
  slug: z.string().optional(),
  summary: z.string().min(1, { message: "Tóm tắt không được để trống" }),
  content: z.string().min(1, { message: "Nội dung không được để trống" }),
  imageUrl: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  period_id: z.number().nullable().optional(),
  event_id: z.number().nullable().optional(),
  figure_id: z.number().nullable().optional(),
  site_id: z.number().nullable().optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

const NewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form tạo tin tức mới
  const createForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      imageUrl: null,
      is_published: false,
      is_featured: false,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null,
    },
  });

  // Form cập nhật tin tức
  const editForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      imageUrl: null,
      is_published: false,
      is_featured: false,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null,
    },
  });

  // Query lấy danh sách tin tức
  const {
    data: newsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/admin/news", page, limit, status, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
        search: searchQuery,
      });
      const response = await apiRequest(
        "GET",
        `/api/admin/news?${params.toString()}`
      );
      return response.json();
    },
  });

  // Queries để lấy dữ liệu cho các dropdown
  const { data: periodsData } = useQuery({
    queryKey: ["/api/periods"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/periods");
      return response.json();
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return response.json();
    },
  });

  const { data: figuresData } = useQuery({
    queryKey: ["/api/historical-figures"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/historical-figures");
      return response.json();
    },
  });

  const { data: sitesData } = useQuery({
    queryKey: ["/api/historical-sites"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/historical-sites");
      return response.json();
    },
  });

  // Mutation để tạo tin tức mới
  const createNewsMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      const response = await apiRequest("POST", "/api/admin/news", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      toast({
        title: "Thành công",
        description: "Đã tạo tin tức mới",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: `Không thể tạo tin tức: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation để cập nhật tin tức
  const updateNewsMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: NewsFormValues;
    }) => {
      const response = await apiRequest("PUT", `/api/admin/news/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật tin tức",
      });
      setIsEditDialogOpen(false);
      setSelectedNews(null);
      editForm.reset();
      setImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật tin tức: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation để xóa tin tức
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/news/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      toast({
        title: "Thành công",
        description: "Đã xóa tin tức",
      });
      setIsDeleteDialogOpen(false);
      setSelectedNews(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa tin tức: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Sử dụng để tải lại dữ liệu khi các tham số thay đổi
  useEffect(() => {
    refetch();
  }, [page, limit, status, searchQuery, refetch]);

  // Reset form khi mở dialog tạo mới
  useEffect(() => {
    if (isCreateDialogOpen) {
      createForm.reset({
        title: "",
        slug: "",
        summary: "",
        content: "",
        imageUrl: null,
        is_published: false,
        is_featured: false,
        period_id: null,
        event_id: null,
        figure_id: null,
        site_id: null,
      });
      setImagePreview(null);
    }
  }, [isCreateDialogOpen, createForm]);

  // Điền dữ liệu vào form khi chọn tin tức để chỉnh sửa
  useEffect(() => {
    if (selectedNews && isEditDialogOpen) {
      editForm.reset({
        title: selectedNews.title,
        slug: selectedNews.slug,
        summary: selectedNews.summary || "",
        content: selectedNews.content,
        imageUrl: selectedNews.imageUrl,
        is_published: selectedNews.is_published,
        is_featured: selectedNews.is_featured,
        period_id: selectedNews.period_id,
        event_id: selectedNews.event_id,
        figure_id: selectedNews.figure_id,
        site_id: selectedNews.site_id,
      });
      setImagePreview(selectedNews.imageUrl);
    }
  }, [selectedNews, isEditDialogOpen, editForm]);

  // Hàm xử lý khi submit form tạo tin tức
  const handleCreateSubmit = (data: NewsFormValues) => {
    createNewsMutation.mutate(data);
  };

  // Hàm xử lý khi submit form cập nhật tin tức
  const handleEditSubmit = (data: NewsFormValues) => {
    if (selectedNews) {
      updateNewsMutation.mutate({ id: selectedNews.id, data });
    }
  };

  // Hàm xử lý khi xác nhận xóa tin tức
  const handleDeleteConfirm = () => {
    if (selectedNews) {
      deleteNewsMutation.mutate(selectedNews.id);
    }
  };

  // Hàm xử lý upload hình ảnh
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, formType: 'create' | 'edit') => {
    const form = formType === 'create' ? createForm : editForm;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file hình ảnh",
        variant: "destructive",
      });
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Tạo FormData để upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Gọi API upload
      const response = await fetch('/api/admin/news/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Không thể upload hình ảnh');
      }
      
      const data = await response.json();
      
      // Cập nhật form với URL hình ảnh mới
      form.setValue('imageUrl', data.url);
      setImagePreview(data.url);
      
      toast({
        title: "Thành công",
        description: "Đã upload hình ảnh",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `Không thể upload hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xóa hình ảnh
  const handleRemoveImage = (formType: 'create' | 'edit') => {
    const form = formType === 'create' ? createForm : editForm;
    form.setValue('imageUrl', null);
    setImagePreview(null);
  };

  // Xử lý khi nhập vào ô tìm kiếm
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Xử lý khi nhấn Enter trong ô tìm kiếm
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      refetch();
    }
  };

  // Tạo các trang cho phân trang
  const renderPagination = () => {
    if (!newsData || !newsData.total) return null;

    const totalPages = Math.ceil(newsData.total / limit);
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageItems = [];
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((old) => Math.max(1, old - 1))}
              disabled={page === 1}
            />
          </PaginationItem>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationLink disabled>...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}
          {pageItems}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink disabled>...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((old) => Math.min(totalPages, old + 1))}
              disabled={page === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const imageUploadField = (formType: 'create' | 'edit') => {
    const form = formType === 'create' ? createForm : editForm;
    
    return (
      <div className="space-y-4">
        <FormLabel>Hình ảnh đại diện</FormLabel>
        <div className="flex flex-col space-y-2">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-[200px] object-cover rounded-md" 
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleRemoveImage(formType)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-md flex flex-col items-center justify-center h-[150px]">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Chưa có hình ảnh</p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              type="file"
              id={`image-upload-${formType}`}
              accept="image/*"
              onChange={(e) => handleImageUpload(e, formType)}
              disabled={uploadingImage}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`image-upload-${formType}`)?.click()}
              disabled={uploadingImage}
              className="w-full"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>Chọn hình ảnh</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Form tạo tin tức mới
  const createNewsForm = (
    <Form {...createForm}>
      <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={createForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề tin tức" {...field} />
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
                      placeholder="Tự động tạo từ tiêu đề nếu để trống"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tóm tắt tin tức" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={createForm.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Xuất bản</FormLabel>
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

              <FormField
                control={createForm.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Nổi bật</FormLabel>
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
            </div>

            <div className="space-y-4">
              <FormField
                control={createForm.control}
                name="period_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời kỳ liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {periodsData?.map((period: any) => (
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
                control={createForm.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sự kiện liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sự kiện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {eventsData?.map((event: any) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="figure_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhân vật liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân vật" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {figuresData?.map((figure: any) => (
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
                control={createForm.control}
                name="site_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Di tích liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn di tích" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {sitesData?.map((site: any) => (
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
          </div>

          <div className="space-y-6">
            {imageUploadField('create')}

            <FormField
              control={createForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      uploadPath="/api/admin/news/upload"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={createNewsMutation.isPending}
            className="w-[150px]"
          >
            {createNewsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo tin tức"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // Form chỉnh sửa tin tức
  const editNewsForm = (
    <Form {...editForm}>
      <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề tin tức" {...field} />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tự động tạo từ tiêu đề nếu để trống"
                      {...field}
                      value={field.value || ""}
                    />
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
                    <Input placeholder="Nhập tóm tắt tin tức" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={editForm.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Xuất bản</FormLabel>
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

              <FormField
                control={editForm.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Nổi bật</FormLabel>
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
            </div>

            <div className="space-y-4">
              <FormField
                control={editForm.control}
                name="period_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời kỳ liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {periodsData?.map((period: any) => (
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
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sự kiện liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sự kiện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {eventsData?.map((event: any) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.name}
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
                name="figure_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhân vật liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân vật" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {figuresData?.map((figure: any) => (
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
                name="site_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Di tích liên quan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn di tích" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {sitesData?.map((site: any) => (
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
          </div>

          <div className="space-y-6">
            {imageUploadField('edit')}

            <FormField
              control={editForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      uploadPath="/api/admin/news/upload"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={updateNewsMutation.isPending}
            className="w-[150px]"
          >
            {updateNewsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý tin tức</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo tin tức mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo tin tức mới</DialogTitle>
              </DialogHeader>
              {createNewsForm}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Tìm kiếm tin tức..."
                className="pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">tin tức mỗi trang</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </div>
        ) : newsData && newsData.data && newsData.data.length > 0 ? (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Lượt xem</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsData.data.map((item: News) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {item.summary}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {item.is_published ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                              Đã xuất bản
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                              Bản nháp
                            </span>
                          )}
                          {item.is_featured && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                              Nổi bật
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.view_count}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.is_published && (
                            <a
                              href={`/news/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-500 transition-colors hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Xem</span>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNews(item);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNews(item);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-center">
              {renderPagination()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <div className="text-3xl font-semibold text-gray-400 mb-2">
              Không có tin tức nào
            </div>
            <p className="text-gray-500 mb-4">
              Bạn chưa tạo tin tức nào. Hãy bắt đầu bằng cách tạo tin tức mới.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo tin tức đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Dialog chỉnh sửa tin tức */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tin tức</DialogTitle>
          </DialogHeader>
          {editNewsForm}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tin tức</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Bạn có chắc chắn muốn xóa tin tức "{selectedNews?.title}"? Hành động này
              không thể hoàn tác.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteNewsMutation.isPending}
            >
              {deleteNewsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default NewsPage;
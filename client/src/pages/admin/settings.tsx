import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string;
  displayName: string;
  category: string;
  inputType: string;
  sortOrder: number;
}

const settingSchema = z.object({
  value: z.string(),
});

type SettingFormValues = z.infer<typeof settingSchema>;

export default function SettingsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch all settings
  const { data: settings, isLoading, refetch } = useQuery<Setting[]>({
    queryKey: ['/api/settings'], // Sử dụng queryKey cố định
    queryFn: async () => {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/settings?t=${timestamp}`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
    staleTime: 0, // Dữ liệu luôn được coi là đã cũ
    refetchOnMount: true, // Luôn refetch khi component được tạo
    refetchOnWindowFocus: true, // Refetch khi cửa sổ được focus lại
  });

  // Group settings by category
  const settingsByCategory = settings?.reduce((acc, setting) => {
    const category = setting.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>) || {};

  // Get all unique categories
  const categories = Object.keys(settingsByCategory).sort();

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const timestamp = new Date().getTime(); // Thêm timestamp để tránh cache
      const res = await apiRequest('PUT', `/api/settings/${key}?t=${timestamp}`, { value });
      return res.json();
    },
    onSuccess: () => {
      // Tắt cache và buộc tải lại dữ liệu mới
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Cập nhật thành công',
        description: 'Thiết lập đã được cập nhật.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi khi cập nhật',
        description: error.message || 'Có lỗi xảy ra khi cập nhật thiết lập.',
        variant: 'destructive',
      });
    },
  });

  // Initialize settings mutation
  const initializeSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/settings/initialize', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Khởi tạo thành công',
        description: 'Các thiết lập mặc định đã được khởi tạo.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi khi khởi tạo',
        description: error.message || 'Có lỗi xảy ra khi khởi tạo thiết lập.',
        variant: 'destructive',
      });
    },
  });

  // Initialize setting values
  const handleInitialize = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khởi tạo tất cả thiết lập mặc định? Hành động này sẽ ghi đè lên các giá trị hiện tại.')) {
      initializeSettingsMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Thiết lập">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Thiết lập">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Thiết lập hệ thống</h1>
          <Button 
            variant="outline" 
            onClick={handleInitialize}
            disabled={initializeSettingsMutation.isPending}
          >
            {initializeSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Khởi tạo mặc định
          </Button>
        </div>

        <Tabs defaultValue={categories[0]} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-8 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="min-w-[120px]"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge className="ml-2" variant="secondary">
                  {settingsByCategory[category].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-8">
              {settingsByCategory[category]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((setting) => (
                  <SettingCard
                    key={setting.id}
                    setting={setting}
                    onUpdate={(value) => 
                      updateSettingMutation.mutate({ key: setting.key, value })
                    }
                    isPending={updateSettingMutation.isPending}
                  />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}

interface SettingCardProps {
  setting: Setting;
  onUpdate: (value: string) => void;
  isPending: boolean;
}

function SettingCard({ setting, onUpdate, isPending }: SettingCardProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    (setting.inputType === 'image' || setting.inputType === 'image-upload') && setting.value ? setting.value : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Xác định các mục cần dùng trình soạn thảo phong phú
  const shouldUseRichText = setting.inputType === 'richtext' 
    || setting.key === 'popup_content'
    || setting.key === 'privacy_policy'
    || setting.key === 'terms_of_service';

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      value: setting.value,
    },
  });

  function onSubmit(data: SettingFormValues) {
    onUpdate(data.value);
  }

  const handleRichTextChange = (value: string) => {
    form.setValue('value', value);
  };

  // Handle sitemap regeneration
  const handleRegenerateSitemap = async () => {
    try {
      const res = await apiRequest('POST', '/api/admin/generate-sitemap', {});
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Cập nhật giá trị thời gian cập nhật
          form.setValue('value', new Date().toISOString());
          onUpdate(new Date().toISOString());
          
          toast({
            title: "Tạo sitemap thành công",
            description: "Sitemap đã được cập nhật từ dữ liệu mới nhất.",
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tạo sitemap:', error);
      toast({
        title: "Lỗi khi tạo sitemap",
        description: "Không thể tạo sitemap. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating all slugs
  const handleUpdateAllSlugs = async () => {
    try {
      toast({
        title: "Đang cập nhật slug...",
        description: "Quá trình này có thể mất vài giây.",
      });
      
      const res = await apiRequest('POST', '/api/admin/update-all-slugs', {});
      
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Lỗi khi phân tích JSON:', jsonError);
        throw new Error('Lỗi định dạng phản hồi');
      }
      
      if (res.ok && data && data.success) {
        const totalUpdated = data.stats?.totalUpdated || 0;
        const totalItems = data.stats?.totalItems || 0;
        
        toast({
          title: "Cập nhật slug thành công",
          description: `Đã cập nhật ${totalUpdated}/${totalItems} slug.`,
        });
        
        // Sau khi cập nhật slug, tự động cập nhật lại sitemap
        handleRegenerateSitemap();
      } else {
        throw new Error(data?.message || 'Cập nhật không thành công');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật slug:', error);
      toast({
        title: "Lỗi khi cập nhật slug",
        description: error instanceof Error ? error.message : "Không thể cập nhật slug. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  // Hàm xử lý tối ưu hóa ảnh
  const handleOptimizeImages = async () => {
    try {
      if (window.confirm('Quá trình tối ưu hóa ảnh có thể mất vài phút tùy thuộc vào số lượng ảnh. Bạn có muốn tiếp tục không?')) {
        toast({
          title: "Đang tối ưu hóa ảnh...",
          description: "Quá trình này có thể mất vài phút. Vui lòng chờ.",
        });
        
        const res = await apiRequest('POST', '/api/admin/optimize-images', {});
        
        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error('Lỗi khi phân tích JSON:', jsonError);
          throw new Error('Lỗi định dạng phản hồi');
        }
        
        if (res.ok && data && data.success) {
          const totalProcessed = data.summary?.totalProcessed || 0;
          const totalSavedSpace = data.summary?.totalSavedSpace || '0 KB';
          
          toast({
            title: "Tối ưu hóa ảnh thành công",
            description: `Đã tối ưu ${totalProcessed} ảnh, tiết kiệm ${totalSavedSpace} dung lượng.`,
          });
        } else {
          throw new Error(data?.message || 'Tối ưu hóa không thành công');
        }
      }
    } catch (error) {
      console.error('Lỗi khi tối ưu hóa ảnh:', error);
      toast({
        title: "Lỗi khi tối ưu hóa ảnh",
        description: error instanceof Error ? error.message : "Không thể tối ưu hóa ảnh. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Handle image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tạo preview ngay lập tức để người dùng thấy
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);

    // Xác định endpoint tải lên dựa trên loại hình ảnh
    let uploadEndpoint = '/api/upload/images';
    
    if (setting.key === 'site_favicon') {
      uploadEndpoint = '/api/upload/favicon';
    } else if (setting.key === 'home_background_url') {
      uploadEndpoint = '/api/upload/backgrounds';
    }

    try {
      // Tạo FormData để tải lên
      const formData = new FormData();
      formData.append('file', file);

      // Tải lên file
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      const fileUrl = data.url;

      // Cập nhật giá trị form
      form.setValue('value', fileUrl);
      
      // Tự động lưu giá trị mới
      onUpdate(fileUrl);

      toast({
        title: 'Tải lên thành công',
        description: 'Hình ảnh đã được tải lên và thiết lập đã được cập nhật.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Lỗi tải lên',
        description: 'Không thể tải lên hình ảnh. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
      // Xóa preview nếu tải lên thất bại
      setImagePreview(setting.value);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{setting.displayName}</CardTitle>
        <CardDescription>{setting.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {setting.inputType === 'image' || setting.inputType === 'image-upload' ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn hình ảnh
                  </Button>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  <Input 
                    {...form.register('value')} 
                    placeholder="URL hình ảnh" 
                    onChange={(e) => {
                      form.setValue('value', e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <div className="w-full h-[200px] overflow-hidden rounded-md border">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : shouldUseRichText ? (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={handleRichTextChange}
                        placeholder="Nhập nội dung..."
                        height={400}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Key: {setting.key}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : setting.key === 'popup_enabled' || setting.inputType === 'select' ? (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{setting.displayName}</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          {setting.key === 'popup_enabled' || setting.key === 'sitemap_auto_update' ? (
                            <>
                              <option value="true">Bật</option>
                              <option value="false">Tắt</option>
                            </>
                          ) : setting.key === 'sitemap_changefreq' ? (
                            <>
                              <option value="always">Luôn luôn</option>
                              <option value="hourly">Hàng giờ</option>
                              <option value="daily">Hàng ngày</option>
                              <option value="weekly">Hàng tuần</option>
                              <option value="monthly">Hàng tháng</option>
                              <option value="yearly">Hàng năm</option>
                              <option value="never">Không bao giờ</option>
                            </>
                          ) : (
                            <>
                              <option value={field.value}>{field.value}</option>
                            </>
                          )}
                        </select>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      {setting.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : setting.key === 'last_sitemap_update' ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian cập nhật gần nhất</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input {...field} readOnly className="flex-1" />
                          <Button 
                            type="button" 
                            onClick={handleRegenerateSitemap}
                            className="whitespace-nowrap"
                            variant="secondary"
                          >
                            Tạo lại Sitemap
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Nhấn nút "Tạo lại Sitemap" để cập nhật sitemap.xml từ dữ liệu mới nhất
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cập nhật URL Slug</h4>
                    <div className="flex space-x-2 items-center">
                      <p className="text-xs text-gray-500 flex-1">
                        Cập nhật tất cả URL slug để hỗ trợ đầy đủ tiếng Việt có dấu
                      </p>
                      <Button 
                        type="button" 
                        onClick={handleUpdateAllSlugs}
                        className="whitespace-nowrap"
                        variant="outline"
                        size="sm"
                      >
                        Cập nhật tất cả Slug
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-medium mb-2">Tối ưu hóa hình ảnh</h4>
                    <div className="flex space-x-2 items-center">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">
                          Tối ưu hóa tất cả hình ảnh đã tải lên để giảm dung lượng và tăng tốc độ tải trang
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-amber-600 dark:text-amber-400">Lưu ý:</span> Quá trình này có thể mất vài phút tùy thuộc vào số lượng ảnh
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleOptimizeImages}
                        className="whitespace-nowrap"
                        variant="outline"
                        size="sm"
                      >
                        Tối ưu hóa ảnh
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-medium">Thông tin sitemap</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Sitemap được tạo tự động bao gồm các trang sau:
                    </p>
                    <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1 mt-2">
                      <li>Trang chủ</li>
                      <li>Tất cả các thời kỳ lịch sử</li>
                      <li>Tất cả các sự kiện lịch sử</li>
                      <li>Tất cả các nhân vật lịch sử</li>
                      <li>Tất cả các di tích lịch sử</li>
                      <li>Tất cả các bài viết tin tức</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Tệp sitemap.xml được tạo tại: <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">client/public/sitemap.xml</code>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị</FormLabel>
                    <FormControl>
                      {setting.inputType === 'textarea' ? (
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      ) : (
                        <Input {...field} />
                      )}
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Key: {setting.key}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
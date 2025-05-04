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
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
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
      const res = await apiRequest('PUT', `/api/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: () => {
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

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý thiết lập">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý thiết lập">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thiết lập hệ thống</h2>
        <Button
          onClick={() => initializeSettingsMutation.mutate()}
          disabled={initializeSettingsMutation.isPending}
        >
          {initializeSettingsMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Khởi tạo mặc định
        </Button>
      </div>

      {/* Tabs for categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'general' ? 'Chung' : 
               category === 'social' ? 'Mạng xã hội' :
               category === 'notifications' ? 'Thông báo' : category}
              <Badge variant="outline" className="ml-2">
                {settingsByCategory[category]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content for each category */}
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {settingsByCategory[category]?.map((setting) => (
                <SettingCard
                  key={setting.id}
                  setting={setting}
                  onUpdate={(value) =>
                    updateSettingMutation.mutate({ key: setting.key, value })
                  }
                  isPending={updateSettingMutation.isPending}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
}

interface SettingCardProps {
  setting: Setting;
  onUpdate: (value: string) => void;
  isPending: boolean;
}

function SettingCard({ setting, onUpdate, isPending }: SettingCardProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      value: setting.value,
    },
  });

  function onSubmit(data: SettingFormValues) {
    onUpdate(data.value);
  }

  // Rich text editor modules/formats for ReactQuill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Handle rich text changes
  const handleRichTextChange = (value: string) => {
    form.setValue('value', value);
  };

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      form.setValue('value', base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('value', url);
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // Handle upload mode toggle
  const toggleUploadMode = (mode: 'url' | 'file') => {
    setUploadMode(mode);
    if (mode === 'file' && fileInputRef.current) {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  // Determine if this setting is an image setting
  const isImageSetting = setting.key === 'home_background_url' || setting.key === 'site_favicon';

  // Determine if this setting should use the rich text editor
  const shouldUseRichText = setting.inputType === 'textarea' && 
    (setting.key === 'privacy_policy' || setting.key === 'terms_of_service');

  // Initialize image preview if it's an image setting
  useEffect(() => {
    if (isImageSetting && setting.value) {
      setImagePreview(setting.value);
    }
  }, [isImageSetting, setting.value]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{setting.displayName}</CardTitle>
        <CardDescription>{setting.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {isImageSetting ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Button 
                    type="button" 
                    variant={uploadMode === 'url' ? 'default' : 'outline'}
                    onClick={() => toggleUploadMode('url')}
                    className="flex-1"
                  >
                    URL Ảnh
                  </Button>
                  <Button 
                    type="button" 
                    variant={uploadMode === 'file' ? 'default' : 'outline'}
                    onClick={() => toggleUploadMode('file')}
                    className="flex-1"
                  >
                    Tải lên ảnh
                  </Button>
                </div>

                {uploadMode === 'url' ? (
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{setting.key === 'home_background_url' ? 'URL ảnh nền' : 'URL hoặc mã base64 của icon'}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                            onChange={handleUrlChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {setting.key === 'home_background_url' 
                            ? 'Nhập URL hình ảnh từ internet' 
                            : 'Nhập URL hình ảnh hoặc mã base64 cho favicon'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-gray-500">
                          Nhấp để chọn ảnh hoặc kéo và thả ảnh vào đây
                        </div>
                        <div className="text-xs text-gray-400">
                          PNG, JPG, GIF lên đến 10MB
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Xem trước:</p>
                    <div className="relative rounded-md overflow-hidden h-40 bg-gray-100">
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
                      <div className="min-h-[300px] border border-input rounded-md">
                        <ReactQuill 
                          theme="snow"
                          value={field.value}
                          onChange={handleRichTextChange}
                          modules={modules}
                          className="h-64"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Key: {setting.key}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

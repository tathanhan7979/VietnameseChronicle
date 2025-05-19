import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowDown, ArrowUp, Trash, Pencil, Plus, Loader2 } from "lucide-react";
import { Contributor } from "@shared/schema";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

// Form schema cho người đóng góp
const contributorSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.string().min(2, "Vai trò phải có ít nhất 2 ký tự"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  avatarUrl: z.string().optional(),
  contactInfo: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ContributorFormValues = z.infer<typeof contributorSchema>;

// Component quản lý người đóng góp
export default function ContributorsAdmin() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [deletingContributor, setDeletingContributor] = useState<Contributor | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ContributorFormValues>({
    resolver: zodResolver(contributorSchema),
    defaultValues: {
      name: "",
      role: "",
      description: "",
      avatarUrl: "",
      contactInfo: "",
      isActive: true,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      role: "",
      description: "",
      avatarUrl: "",
      contactInfo: "",
      isActive: true,
    });
    setImagePreview(null);
    setImageFile(null);
  };

  // Query để lấy danh sách người đóng góp
  const { data: contributors, isLoading, refetch } = useQuery({
    queryKey: ['/api/contributors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/contributors');
      if (!res.ok) {
        throw new Error('Failed to fetch contributors');
      }
      return await res.json();
    },
  });

  // Mutation để thêm người đóng góp mới
  const createMutation = useMutation({
    mutationFn: async (data: ContributorFormValues) => {
      let avatarUrl = data.avatarUrl;

      // Upload ảnh nếu có
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Upload failed');
        }
        
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Tạo người đóng góp mới
      const res = await apiRequest('POST', '/api/admin/contributors', {
        ...data,
        avatarUrl,
      });
      
      if (!res.ok) {
        throw new Error('Create failed');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã thêm người đóng góp mới',
      });
      resetForm();
      setShowAddDialog(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể thêm người đóng góp: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation để cập nhật người đóng góp
  const updateMutation = useMutation({
    mutationFn: async (data: ContributorFormValues & { id: number }) => {
      const { id, ...rest } = data;
      let avatarUrl = rest.avatarUrl;

      // Upload ảnh nếu có
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Upload failed');
        }
        
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Cập nhật người đóng góp
      const res = await apiRequest('PUT', `/api/admin/contributors/${id}`, {
        ...rest,
        avatarUrl,
      });
      
      if (!res.ok) {
        throw new Error('Update failed');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin người đóng góp',
      });
      resetForm();
      setEditingContributor(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể cập nhật người đóng góp: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation để xóa người đóng góp
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/contributors/${id}`);
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã xóa người đóng góp',
      });
      setDeletingContributor(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể xóa người đóng góp: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation để cập nhật thứ tự
  const updateSortOrderMutation = useMutation({
    mutationFn: async ({ id, sortOrder }: { id: number; sortOrder: number }) => {
      const res = await apiRequest('PATCH', `/api/admin/contributors/${id}/sort-order`, { sortOrder });
      if (!res.ok) {
        throw new Error('Failed to update sort order');
      }
      return await res.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: `Không thể cập nhật thứ tự hiển thị: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Cập nhật form khi edit
  useEffect(() => {
    if (editingContributor) {
      form.reset({
        name: editingContributor.name,
        role: editingContributor.role,
        description: editingContributor.description,
        avatarUrl: editingContributor.avatarUrl || "",
        contactInfo: editingContributor.contactInfo || "",
        isActive: editingContributor.isActive,
      });
      setImagePreview(editingContributor.avatarUrl || null);
    }
  }, [editingContributor, form]);

  // Xử lý upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý submit form khi thêm hoặc cập nhật
  const onSubmit = (values: ContributorFormValues) => {
    if (editingContributor) {
      updateMutation.mutate({ ...values, id: editingContributor.id });
    } else {
      createMutation.mutate(values);
    }
  };

  // Cảm biến cho DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Xử lý khi kéo thả kết thúc
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id && contributors) {
      const oldIndex = contributors.findIndex(c => c.id === active.id);
      const newIndex = contributors.findIndex(c => c.id === over.id);
      
      // Cập nhật thứ tự mới
      updateSortOrderMutation.mutate({ 
        id: active.id, 
        sortOrder: newIndex 
      });
    }
  };

  // Component item có thể kéo thả
  function SortableContributorRow({ contributor }: { contributor: Contributor }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: contributor.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab',
    };
    
    return (
      <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TableCell>
          <div className="flex items-center justify-center">
            <div className="cursor-grab w-6 h-6 flex items-center justify-center">
              ⋮⋮
            </div>
          </div>
        </TableCell>
        <TableCell className="font-medium">{contributor.id}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            {contributor.avatarUrl && (
              <img
                src={contributor.avatarUrl}
                alt={contributor.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/error-img.png';
                }}
              />
            )}
            <span>{contributor.name}</span>
          </div>
        </TableCell>
        <TableCell>{contributor.role}</TableCell>
        <TableCell className="max-w-[200px] truncate">{contributor.description}</TableCell>
        <TableCell>{contributor.contactInfo}</TableCell>
        <TableCell>
          <div className={`w-3 h-3 rounded-full ${contributor.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingContributor(contributor)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeletingContributor(contributor)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <AdminLayout title="Quản lý người đóng góp">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý người đóng góp</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm người đóng góp
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người đóng góp</CardTitle>
            <CardDescription>
              Quản lý danh sách người đã đóng góp xây dựng website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Thứ tự</TableHead>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributors && contributors.length > 0 ? (
                      <SortableContext
                        items={contributors.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {contributors.map((contributor) => (
                          <SortableContributorRow 
                            key={contributor.id} 
                            contributor={contributor} 
                          />
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Chưa có người đóng góp nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog thêm/sửa người đóng góp */}
      <Dialog 
        open={showAddDialog || editingContributor !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingContributor(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingContributor ? "Sửa thông tin người đóng góp" : "Thêm người đóng góp mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin người đóng góp vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên người đóng góp</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhà phát triển, Thiết kế,...etc" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={5}
                            placeholder="Mô tả về đóng góp của người này"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input 
                              placeholder="URL ảnh đại diện"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setImagePreview(e.target.value);
                                setImageFile(null);
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">hoặc</span>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="w-auto"
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          {imagePreview && (
                            <div className="relative w-24 h-24 overflow-hidden rounded-full border">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setImagePreview(null)}
                              />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thông tin liên hệ</FormLabel>
                        <FormControl>
                          <Input placeholder="Email, số điện thoại, website,..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hiển thị trên website</FormLabel>
                          <FormDescription>
                            Nếu bỏ chọn, người đóng góp này sẽ không hiển thị trên website
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingContributor(null);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingContributor ? "Cập nhật" : "Thêm mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deletingContributor !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingContributor(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người đóng góp <strong>{deletingContributor?.name}</strong>? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeletingContributor(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingContributor) {
                  deleteMutation.mutate(deletingContributor.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
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
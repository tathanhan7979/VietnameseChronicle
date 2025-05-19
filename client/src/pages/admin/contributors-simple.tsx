import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Trash, Pencil, Plus, Loader2 } from "lucide-react";

// Define contributor interface
interface Contributor {
  id: number;
  name: string;
  role: string;
  description: string;
  avatarUrl?: string;
  contactInfo?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Schema for form validation
const contributorSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.string().min(2, "Vai trò phải có ít nhất 2 ký tự"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  avatarUrl: z.string().optional(),
  contactInfo: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

type ContributorFormValues = z.infer<typeof contributorSchema>;

export default function ContributorsSimple() {
  const { toast } = useToast();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [deletingContributor, setDeletingContributor] = useState<Contributor | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<ContributorFormValues>({
    resolver: zodResolver(contributorSchema),
    defaultValues: {
      name: "",
      role: "",
      description: "",
      avatarUrl: "",
      contactInfo: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Reset form helper
  const resetForm = () => {
    form.reset({
      name: "",
      role: "",
      description: "",
      avatarUrl: "",
      contactInfo: "",
      isActive: true,
      sortOrder: 0,
    });
    setImagePreview(null);
    setImageFile(null);
  };

  // Fetch contributors
  const fetchContributors = async () => {
    setIsLoading(true);
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch("/api/contributors", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include", // Gửi cookies nếu có
      });
      
      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        throw new Error(`Failed to fetch contributors: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Contributors data:", data);
      setContributors(data);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người đóng góp",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    // Tạo hàm async để fetch dữ liệu
    const loadData = async () => {
      console.log("Loading contributors data...");
      await fetchContributors();
    };
    
    // Gọi hàm load data
    loadData();
    
    // Thiết lập interval để làm mới dữ liệu mỗi 10 giây
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing contributors data...");
      fetchContributors();
    }, 10000);
    
    // Clear interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update form values when editing
  useEffect(() => {
    if (editingContributor) {
      form.reset({
        name: editingContributor.name,
        role: editingContributor.role,
        description: editingContributor.description,
        avatarUrl: editingContributor.avatarUrl || "",
        contactInfo: editingContributor.contactInfo || "",
        isActive: editingContributor.isActive,
        sortOrder: editingContributor.sortOrder || 0,
      });
      setImagePreview(editingContributor.avatarUrl || null);
    }
  }, [editingContributor, form]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (values: ContributorFormValues) => {
    setIsSubmitting(true);
    try {
      let avatarUrl = values.avatarUrl || "";

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        // Lấy token từ localStorage cho upload
        const uploadToken = localStorage.getItem('authToken');

        const uploadRes = await fetch("/api/upload/contributors", {
          method: "POST",
          headers: {
            ...(uploadToken ? { "Authorization": `Bearer ${uploadToken}` } : {})
          },
          credentials: "include",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Create or update contributor
      const endpoint = editingContributor
        ? `/api/admin/contributors/${editingContributor.id}`
        : "/api/admin/contributors";
      
      const method = editingContributor ? "PUT" : "POST";
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
        
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include", // Gửi cookies nếu có
        body: JSON.stringify({
          ...values,
          avatarUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${editingContributor ? "update" : "create"} contributor`);
      }

      // Success message
      toast({
        title: "Thành công",
        description: editingContributor
          ? "Đã cập nhật thông tin người đóng góp"
          : "Đã thêm người đóng góp mới",
      });

      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
      setEditingContributor(null);
      
      // Refresh the list immediately
      fetchContributors();
      
      // Hiển thị thông báo cho người dùng biết cần refresh trang
      toast({
        title: "Cập nhật dữ liệu",
        description: "Dữ liệu đã được cập nhật thành công. Đang tải lại danh sách mới nhất...",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Lỗi",
        description: `Không thể ${editingContributor ? "cập nhật" : "thêm"} người đóng góp: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingContributor) return;
    
    setIsSubmitting(true);
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
      
      const res = await fetch(`/api/admin/contributors/${deletingContributor.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include", // Gửi cookies nếu có
      });

      if (!res.ok) {
        throw new Error("Failed to delete contributor");
      }

      toast({
        title: "Thành công",
        description: "Đã xóa người đóng góp",
      });

      setDeletingContributor(null);
      
      // Refresh the list
      fetchContributors();
      
      // Hiển thị thông báo cho người dùng biết dữ liệu đã được cập nhật
      toast({
        title: "Cập nhật dữ liệu",
        description: "Người đóng góp đã được xóa thành công. Đang tải lại danh sách mới nhất...",
      });
    } catch (error) {
      console.error("Error deleting contributor:", error);
      toast({
        title: "Lỗi",
        description: `Không thể xóa người đóng góp: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Quản lý người đóng góp">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý người đóng góp</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => fetchContributors()}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path>
                <path d="M13 21h6v-6"></path>
              </svg>
              Làm mới
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm người đóng góp
            </Button>
          </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
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
                    contributors.map((contributor) => (
                      <TableRow key={contributor.id}>
                        <TableCell className="font-medium">{contributor.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {contributor.avatarUrl && (
                              <img
                                src={contributor.avatarUrl}
                                alt={contributor.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/uploads/error-img.png";
                                }}
                              />
                            )}
                            <span>{contributor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contributor.role}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {contributor.description}
                        </TableCell>
                        <TableCell>{contributor.contactInfo}</TableCell>
                        <TableCell>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              contributor.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 justify-end">
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Chưa có người đóng góp nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              {editingContributor
                ? "Sửa thông tin người đóng góp"
                : "Thêm người đóng góp mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin người đóng góp vào form bên dưới
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
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
                          <Input placeholder="Lập trình viên" {...field} />
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
                            placeholder="Mô tả chi tiết về đóng góp của người này"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <div className="flex items-center space-x-4">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="avatarUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-col space-y-2">
                                  <Input
                                    placeholder="URL ảnh đại diện"
                                    {...field}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    hoặc
                                  </span>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thông tin liên hệ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email, website, mạng xã hội..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hiển thị trên trang chủ</FormLabel>
                          <FormDescription>
                            Chọn để hiển thị người đóng góp này trên trang chủ
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
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
          if (!open) {
            setDeletingContributor(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người đóng góp này không? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingContributor(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
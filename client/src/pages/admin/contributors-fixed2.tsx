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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash, RefreshCw } from "lucide-react";

// Định nghĩa kiểu dữ liệu người đóng góp
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

export default function ContributorsFixed2() {
  const { toast } = useToast();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    contactInfo: "",
    avatarUrl: "",
    isActive: true,
    sortOrder: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải danh sách người đóng góp
  const fetchContributors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/contributors", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error("Không thể tải danh sách người đóng góp");
      }
      
      const data = await response.json();
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

  // Tải danh sách khi component được mount
  useEffect(() => {
    fetchContributors();
  }, []);

  // Xử lý khi mở dialog chỉnh sửa
  const handleEdit = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setFormData({
      name: contributor.name,
      role: contributor.role,
      description: contributor.description,
      contactInfo: contributor.contactInfo || "",
      avatarUrl: contributor.avatarUrl || "",
      isActive: contributor.isActive,
      sortOrder: contributor.sortOrder,
    });
    setImagePreview(contributor.avatarUrl || null);
    setIsEditing(true);
  };

  // Xử lý khi mở dialog thêm mới
  const handleAdd = () => {
    setSelectedContributor(null);
    setFormData({
      name: "",
      role: "",
      description: "",
      contactInfo: "",
      avatarUrl: "",
      isActive: true,
      sortOrder: 0,
    });
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(true);
  };

  // Xử lý khi mở dialog xóa
  const handleDelete = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setIsDeleting(true);
  };

  // Xử lý khi đóng các dialog
  const handleCloseDialogs = () => {
    setIsEditing(false);
    setIsDeleting(false);
    setSelectedContributor(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // Xử lý khi thay đổi form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi thay đổi checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  // Xử lý khi thay đổi file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý khi xác nhận thêm/sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate data
      if (!formData.name || !formData.role || !formData.description) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ các trường bắt buộc",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let avatarUrl = formData.avatarUrl;

      // Upload ảnh nếu có
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", imageFile);

        const token = localStorage.getItem("authToken");
        const uploadRes = await fetch("/api/upload/contributors", {
          method: "POST",
          body: formDataUpload,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!uploadRes.ok) {
          throw new Error("Không thể tải lên ảnh");
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Xác định endpoint và method
      const isUpdate = selectedContributor !== null;
      const endpoint = isUpdate
        ? `/api/admin/contributors/${selectedContributor.id}`
        : "/api/admin/contributors";
      const method = isUpdate ? "PUT" : "POST";

      // Gọi API
      const token = localStorage.getItem("authToken");
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          avatarUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Không thể ${isUpdate ? "cập nhật" : "thêm"} người đóng góp`
        );
      }

      // Hiển thị thông báo thành công
      toast({
        title: "Thành công",
        description: isUpdate
          ? "Đã cập nhật thông tin người đóng góp"
          : "Đã thêm người đóng góp mới",
      });

      // Đóng dialog và load lại dữ liệu
      handleCloseDialogs();
      fetchContributors();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý khi xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!selectedContributor) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/contributors/${selectedContributor.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Không thể xóa người đóng góp");
      }

      toast({
        title: "Thành công",
        description: "Đã xóa người đóng góp",
      });

      handleCloseDialogs();
      fetchContributors();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa",
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
          <div className="space-x-2">
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Thêm người đóng góp
            </Button>
            <Button variant="outline" onClick={fetchContributors} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
              Làm mới
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người đóng góp</CardTitle>
            <CardDescription>
              Quản lý thông tin người đóng góp xây dựng website
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
                  {contributors.length > 0 ? (
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
                              onClick={() => handleEdit(contributor)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(contributor)}
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

      {/* Dialog thêm/sửa */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCloseDialogs()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedContributor ? "Sửa thông tin người đóng góp" : "Thêm người đóng góp mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin người đóng góp vào form bên dưới
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Tên người đóng góp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    placeholder="Lập trình viên"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Mô tả chi tiết về đóng góp của người này"
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactInfo" className="text-sm font-medium">
                    Thông tin liên hệ
                  </label>
                  <Input
                    id="contactInfo"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleFormChange}
                    placeholder="Email, số điện thoại..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="avatarUrl" className="text-sm font-medium">
                    Ảnh đại diện
                  </label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        id="avatarUrl"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleFormChange}
                        placeholder="Đường dẫn ảnh"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Hoặc tải lên:</span>
                        <Input
                          id="avatarUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hiển thị trên trang chủ
                  </label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sortOrder" className="text-sm font-medium">
                    Thứ tự sắp xếp
                  </label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder.toString()}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCloseDialogs}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                  </>
                ) : (
                  "Lưu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && handleCloseDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người đóng góp này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialogs}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
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
}
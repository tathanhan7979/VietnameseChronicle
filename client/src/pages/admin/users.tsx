import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";

// Định nghĩa schema cho form
const userFormSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  password: z.string().optional(),
  isAdmin: z.boolean().default(false),
  can_manage_periods: z.boolean().default(false),
  can_manage_events: z.boolean().default(false),
  can_manage_figures: z.boolean().default(false),
  can_manage_sites: z.boolean().default(false),
});

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  can_manage_periods: boolean;
  can_manage_events: boolean;
  can_manage_figures: boolean;
  can_manage_sites: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const UsersPage = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch danh sách người dùng
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 10000, // 10 giây
  });

  // Form thêm/sửa người dùng
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      isAdmin: false,
    },
  });

  // Cập nhật form khi chọn người dùng để sửa
  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      form.reset({
        username: selectedUser.username,
        password: "", // Không điền mật khẩu cũ
        isAdmin: selectedUser.isAdmin,
        can_manage_periods: selectedUser.can_manage_periods,
        can_manage_events: selectedUser.can_manage_events,
        can_manage_figures: selectedUser.can_manage_figures,
        can_manage_sites: selectedUser.can_manage_sites,
      });
    }
  }, [form, selectedUser, isEditDialogOpen]);

  // Reset form khi tạo mới
  useEffect(() => {
    if (isCreateDialogOpen) {
      form.reset({
        username: "",
        password: "",
        isAdmin: false,
        can_manage_periods: false,
        can_manage_events: false,
        can_manage_figures: false,
        can_manage_sites: false,
      });
    }
  }, [form, isCreateDialogOpen]);

  // Mutation tạo người dùng mới
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo người dùng mới",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng mới",
        variant: "destructive",
      });
    },
  });

  // Mutation cập nhật người dùng
  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: z.infer<typeof userFormSchema>;
    }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin người dùng",
        variant: "destructive",
      });
    },
  });

  // Mutation xóa người dùng
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng",
        variant: "destructive",
      });
    },
  });

  // Xử lý submit form tạo/sửa người dùng
  const onSubmit = (values: z.infer<typeof userFormSchema>) => {
    if (isEditDialogOpen && selectedUser) {
      // Nếu password rỗng thì không cập nhật password
      if (!values.password) {
        const { password, ...dataWithoutPassword } = values;
        updateUserMutation.mutate({
          id: selectedUser.id,
          data: dataWithoutPassword,
        });
      } else {
        updateUserMutation.mutate({
          id: selectedUser.id,
          data: values,
        });
      }
    } else {
      // Tạo mới phải có password
      if (!values.password) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập mật khẩu",
          variant: "destructive",
        });
        return;
      }
      createUserMutation.mutate(values);
    }
  };

  // Định dạng thời gian
  function formatDate(dateString: string | null) {
    if (!dateString) return "Chưa đăng nhập";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Đã xảy ra lỗi khi tải dữ liệu người dùng</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Quyền hạn</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">
                            Quản trị viên
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-semibold">
                            Người dùng
                          </span>
                        )}
                        {!user.isAdmin && (
                          <>
                            {user.can_manage_periods && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-semibold">
                                Thời kỳ
                              </span>
                            )}
                            {user.can_manage_events && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-semibold">
                                Sự kiện
                              </span>
                            )}
                            {user.can_manage_figures && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-semibold">
                                Nhân vật
                              </span>
                            )}
                            {user.can_manage_sites && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-semibold">
                                Di tích
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Không có dữ liệu người dùng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog tạo người dùng mới */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Thêm tài khoản người dùng mới vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên đăng nhập" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quyền hạn</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const isAdmin = value === "true";
                        field.onChange(isAdmin);
                        
                        // Nếu là admin, tự động bật tất cả quyền
                        if (isAdmin) {
                          form.setValue("can_manage_periods", true);
                          form.setValue("can_manage_events", true);
                          form.setValue("can_manage_figures", true);
                          form.setValue("can_manage_sites", true);
                        }
                      }}
                      defaultValue={field.value ? "true" : "false"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quyền hạn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Người dùng</SelectItem>
                        <SelectItem value="true">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!form.watch("isAdmin") && (
                <div className="space-y-4 border rounded-md p-4 mt-4">
                  <h3 className="font-medium text-sm">Phân quyền chi tiết</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="can_manage_periods"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quản lý thời kỳ</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Thêm, sửa, xóa thời kỳ lịch sử
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="can_manage_events"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quản lý sự kiện</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Thêm, sửa, xóa sự kiện lịch sử
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="can_manage_figures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quản lý nhân vật</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Thêm, sửa, xóa nhân vật lịch sử
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="can_manage_sites"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quản lý di tích</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Thêm, sửa, xóa di tích lịch sử
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Thêm người dùng</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa người dùng */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin người dùng. Để trống mật khẩu nếu không muốn
              thay đổi.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên đăng nhập" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu (để trống nếu không đổi)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quyền hạn</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quyền hạn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Người dùng</SelectItem>
                        <SelectItem value="true">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4" />
                      <span>Lưu thay đổi</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa người dùng */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  deleteUserMutation.mutate(selectedUser.id);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa người dùng</span>
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;
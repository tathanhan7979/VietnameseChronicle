import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Pencil, Trash2, Key, RefreshCw } from 'lucide-react';

interface User {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  isAdmin: boolean;
  isActive: boolean;
  canManagePeriods: boolean;
  canManageEvents: boolean;
  canManageFigures: boolean;
  canManageSites: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

// Form schema chung
const baseUserSchema = {
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ').nullable().optional(),
  isAdmin: z.boolean().default(false),
  isActive: z.boolean().default(true),
  canManagePeriods: z.boolean().default(false),
  canManageEvents: z.boolean().default(false),
  canManageFigures: z.boolean().default(false),
  canManageSites: z.boolean().default(false),
};

// Schema cho tạo mới
const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Schema cho cập nhật (password là tùy chọn)
const updateUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
});

// Schema chung cho form (sử dụng cho cả tạo mới và cập nhật)
const userFormSchema = z.object({
  ...baseUserSchema,
  password: z.string().refine(val => {
    // Trường hợp tạo mới hoặc muốn đổi mật khẩu (val.length > 0)
    if (val.length > 0) {
      return val.length >= 6;
    }
    // Trường hợp chỉnh sửa và không muốn đổi mật khẩu (val.length === 0) 
    return true;
  }, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự hoặc để trống nếu không muốn thay đổi'
  }),
});

// Form schema cho reset mật khẩu
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form cho tạo/chỉnh sửa người dùng
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      isAdmin: false,
      isActive: true,
      canManagePeriods: false,
      canManageEvents: false,
      canManageFigures: false,
      canManageSites: false,
    },
  });

  // Form cho reset mật khẩu
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
    },
  });

  // Query để lấy danh sách người dùng
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return res.json();
    },
  });

  // Mutation để tạo người dùng mới
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const res = await apiRequest('POST', '/api/admin/users', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Thành công',
        description: 'Tạo người dùng mới thành công',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo người dùng mới',
        variant: 'destructive',
      });
    },
  });

  // Mutation để cập nhật người dùng
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateUserSchema>) => {
      if (!selectedUser) return null;
      const res = await apiRequest('PUT', `/api/admin/users/${selectedUser.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Thành công',
        description: 'Cập nhật người dùng thành công',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật người dùng',
        variant: 'destructive',
      });
    },
  });

  // Mutation để xóa người dùng
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return null;
      const res = await apiRequest('DELETE', `/api/admin/users/${selectedUser.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Thành công',
        description: 'Xóa người dùng thành công',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa người dùng',
        variant: 'destructive',
      });
    },
  });

  // Mutation để reset mật khẩu
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resetPasswordSchema>) => {
      if (!selectedUser) return null;
      const res = await apiRequest('POST', `/api/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      resetPasswordForm.reset();
      toast({
        title: 'Thành công',
        description: 'Đặt lại mật khẩu thành công',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể đặt lại mật khẩu',
        variant: 'destructive',
      });
    },
  });

  const handleCreateUser = form.handleSubmit((data) => {
    createUserMutation.mutate(data);
  });

  const handleUpdateUser = form.handleSubmit((data) => {
    // Chuyển đổi dữ liệu từ form thành dữ liệu cập nhật
    const updateData = { ...data };

    // Loại bỏ password nếu không được nhập khi cập nhật
    if (!updateData.password || updateData.password.trim() === '') {
      // Dùng kiểu as để nói với TypeScript rằng dữ liệu này sẽ được xử lý an toàn
      const { password, ...dataWithoutPassword } = updateData;
      updateUserMutation.mutate(dataWithoutPassword as typeof updateUserSchema._type);
    } else {
      updateUserMutation.mutate(updateData);
    }
  });

  const handleResetPassword = resetPasswordForm.handleSubmit((data) => {
    resetPasswordMutation.mutate(data);
  });

  const openCreateDialog = () => {
    form.reset({
      username: '',
      password: '',
      fullName: '',
      email: '',
      isAdmin: false,
      isActive: true,
      canManagePeriods: false,
      canManageEvents: false,
      canManageFigures: false,
      canManageSites: false,
    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    form.reset({
      username: user.username,
      password: '',
      fullName: user.fullName || '',
      email: user.email || '',
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      canManagePeriods: user.canManagePeriods || false,
      canManageEvents: user.canManageEvents || false,
      canManageFigures: user.canManageFigures || false,
      canManageSites: user.canManageSites || false,
    });
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    resetPasswordForm.reset({ newPassword: '' });
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <div className="flex gap-2">
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên người dùng</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Quyền Admin</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Đăng nhập gần nhất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName || '—'}</TableCell>
                  <TableCell>{user.email || '—'}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Có
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                        Không
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                        Vô hiệu
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openResetPasswordDialog(user)}
                        title="Đặt lại mật khẩu"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                        title="Xóa"
                        disabled={user.id === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Không có dữ liệu người dùng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog tạo người dùng mới */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết để tạo người dùng mới trong hệ thống.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người dùng *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập tên người dùng" />
                      </FormControl>
                      <FormDescription>
                        Tên người dùng dùng để đăng nhập vào hệ thống.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="Nhập mật khẩu"
                        />
                      </FormControl>
                      <FormDescription>
                        Mật khẩu phải có ít nhất 6 ký tự.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập họ tên đầy đủ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập địa chỉ email" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quyền Admin</FormLabel>
                          <FormDescription>
                            Người dùng có quyền quản trị hệ thống
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
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Kích hoạt</FormLabel>
                          <FormDescription>
                            Người dùng có thể đăng nhập vào hệ thống
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
                </div>

                <h3 className="text-lg font-medium mt-4">Quyền quản lý nội dung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="canManagePeriods"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý thời kỳ</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa thời kỳ lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý sự kiện</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa sự kiện lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageFigures"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý nhân vật</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa nhân vật lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageSites"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý di tích</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa di tích lịch sử
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
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Tạo người dùng
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog chỉnh sửa người dùng */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin chi tiết của người dùng.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người dùng *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập tên người dùng" />
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
                          {...field}
                          placeholder="Để trống nếu không đổi mật khẩu"
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống nếu không muốn thay đổi mật khẩu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập họ tên đầy đủ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập địa chỉ email" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quyền Admin</FormLabel>
                          <FormDescription>
                            Người dùng có quyền quản trị hệ thống
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
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Kích hoạt</FormLabel>
                          <FormDescription>
                            Người dùng có thể đăng nhập vào hệ thống
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
                </div>

                <h3 className="text-lg font-medium mt-4">Quyền quản lý nội dung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="canManagePeriods"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý thời kỳ</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa thời kỳ lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý sự kiện</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa sự kiện lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageFigures"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý nhân vật</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa nhân vật lịch sử
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
                  <FormField
                    control={form.control}
                    name="canManageSites"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý di tích</FormLabel>
                          <FormDescription>
                            Cho phép thêm/sửa/xóa di tích lịch sử
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
                  </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cập nhật
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận xóa người dùng */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể khôi phục.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteUserMutation.mutate()}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog đặt lại mật khẩu */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
              <DialogDescription>
                Nhập mật khẩu mới cho người dùng {selectedUser?.username}.
              </DialogDescription>
            </DialogHeader>
            <Form {...resetPasswordForm}>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="Nhập mật khẩu mới"
                        />
                      </FormControl>
                      <FormDescription>
                        Mật khẩu phải có ít nhất 6 ký tự.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Đặt lại mật khẩu
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
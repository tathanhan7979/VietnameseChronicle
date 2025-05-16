import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trash2, UserPlus, PenSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Định nghĩa schema cho form
const userFormSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  isAdmin: z.boolean().default(false),
  canManagePeriods: z.boolean().default(false),
  canManageEvents: z.boolean().default(false),
  canManageFigures: z.boolean().default(false),
  canManageSites: z.boolean().default(false),
});

const updateUserFormSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().optional().or(z.literal("")),
  isAdmin: z.boolean().default(false),
  canManagePeriods: z.boolean().default(false),
  canManageEvents: z.boolean().default(false),
  canManageFigures: z.boolean().default(false),
  canManageSites: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Kiểm tra quyền admin
  if (!currentUser?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
        <p>Bạn không có quyền truy cập vào trang quản lý người dùng.</p>
      </div>
    );
  }

  // Lấy danh sách người dùng
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async ({ signal }) => {
      const response = await apiRequest("GET", "/api/admin/users", undefined, { signal });
      return await response.json();
    }
  });

  // Form tạo người dùng mới
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      isAdmin: false,
      canManagePeriods: false,
      canManageEvents: false,
      canManageFigures: false,
      canManageSites: false,
    },
  });

  // Form cập nhật người dùng
  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      username: "",
      password: "",
      isAdmin: false,
      canManagePeriods: false,
      canManageEvents: false,
      canManageFigures: false,
      canManageSites: false,
    },
  });

  // Mutation tạo người dùng mới
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tạo người dùng thành công",
        variant: "default",
      });
      setOpenNewDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi tạo người dùng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation cập nhật người dùng
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: number;
      data: UpdateUserFormValues;
    }) => {
      const { username, ...updateData } = data;
      const response = await apiRequest(
        "PUT",
        `/api/admin/users/${userId}`,
        updateData
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cập nhật người dùng thành công",
        variant: "default",
      });
      setOpenEditDialog(false);
      updateForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi cập nhật người dùng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation xóa người dùng
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Xóa người dùng thành công",
        variant: "default",
      });
      setDeleteUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi xóa người dùng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Xử lý tạo người dùng mới
  const onSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  // Xử lý cập nhật người dùng
  const onUpdateSubmit = (data: UpdateUserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, data });
    }
  };

  // Mở dialog chỉnh sửa người dùng
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    updateForm.reset({
      username: user.username,
      password: "",
      isAdmin: user.isAdmin,
      canManagePeriods: user.canManagePeriods,
      canManageEvents: user.canManageEvents,
      canManageFigures: user.canManageFigures,
      canManageSites: user.canManageSites,
    });
    setOpenEditDialog(true);
  };

  // Xử lý xóa người dùng
  const handleConfirmDelete = () => {
    if (deleteUserId !== null) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin cho người dùng mới và phân quyền
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Quản trị viên</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Người dùng này có quyền quản trị hệ thống
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Phân quyền quản lý nội dung</h3>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="canManagePeriods"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Quản lý thời kỳ</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="canManageEvents"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Quản lý sự kiện</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="canManageFigures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Quản lý nhân vật</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="canManageSites"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Quản lý di tích</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="w-full mt-4"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý tất cả người dùng trong hệ thống và phân quyền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Thời kỳ</TableHead>
                <TableHead>Sự kiện</TableHead>
                <TableHead>Nhân vật</TableHead>
                <TableHead>Di tích</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        Thành viên
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.canManagePeriods ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.canManageEvents ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.canManageFigures ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.canManageSites ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa người dùng "
                                {user.username}" không? Hành động này không thể
                                hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={handleConfirmDelete}>
                                {deleteUserMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : null}
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog chỉnh sửa người dùng */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và phân quyền cho người dùng
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới (để trống nếu không thay đổi)</FormLabel>
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
                control={updateForm.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Quản trị viên</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Người dùng này có quyền quản trị hệ thống
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Phân quyền quản lý nội dung</h3>
                <div className="space-y-2">
                  <FormField
                    control={updateForm.control}
                    name="canManagePeriods"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Quản lý thời kỳ</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="canManageEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Quản lý sự kiện</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="canManageFigures"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Quản lý nhân vật</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="canManageSites"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Quản lý di tích</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="w-full mt-4"
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
    </div>
  );
}
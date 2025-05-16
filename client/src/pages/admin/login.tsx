import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
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

const loginFormSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function AdminLogin() {
  const { user, isLoading, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        if (data.success && data.token) {
          // Chuyển hướng đến trang admin sau khi đăng nhập thành công
          window.location.href = "/admin";
        }
      }
    });
  };

  // Nếu đã đăng nhập, chuyển hướng đến trang quản trị
  if (user) {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="rounded-lg shadow-xl overflow-hidden max-w-6xl w-full grid md:grid-cols-2">
        <div className="bg-white p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                VN
              </div>
              <h2 className="text-2xl font-bold mb-1">Đăng nhập Quản trị</h2>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Ẩn" : "Hiện"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="bg-blue-600 p-8 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Điều khiển trang Lịch sử Việt Nam
            </h3>
            <p className="mb-6">
              Truy cập vào khu vực quản trị để quản lý nội dung về lịch sử, sự
              kiện, nhân vật lịch sử, di tích và các thiết lập khác của trang
              web.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="flex items-center justify-center bg-blue-500 rounded-full w-6 h-6 mr-3">
                  ✓
                </span>
                <p>Quản lý các thời kỳ lịch sử</p>
              </div>
              <div className="flex items-start">
                <span className="flex items-center justify-center bg-blue-500 rounded-full w-6 h-6 mr-3">
                  ✓
                </span>
                <p>Cập nhật sự kiện quan trọng</p>
              </div>
              <div className="flex items-start">
                <span className="flex items-center justify-center bg-blue-500 rounded-full w-6 h-6 mr-3">
                  ✓
                </span>
                <p>Thêm và chỉnh sửa thông tin nhân vật lịch sử</p>
              </div>
              <div className="flex items-start">
                <span className="flex items-center justify-center bg-blue-500 rounded-full w-6 h-6 mr-3">
                  ✓
                </span>
                <p>Quản lý di tích lịch sử</p>
              </div>
              <div className="flex items-start">
                <span className="flex items-center justify-center bg-blue-500 rounded-full w-6 h-6 mr-3">
                  ✓
                </span>
                <p>Xem phản hồi của người dùng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

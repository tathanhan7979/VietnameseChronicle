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
import { Loader2, RefreshCw } from "lucide-react";

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

export default function ContributorsSimple2() {
  const { toast } = useToast();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <AdminLayout title="Quản lý người đóng góp">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý người đóng góp</h1>
          <div className="space-x-2">
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
              Xem thông tin người đóng góp xây dựng website
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
                    <TableHead>Trạng thái</TableHead>
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
    </AdminLayout>
  );
}
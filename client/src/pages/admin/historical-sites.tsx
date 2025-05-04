import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Grid,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  ChevronDown,
  MapPin,
  Map,
  ExternalLink,
} from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Định nghĩa kiểu dữ liệu cho địa danh lịch sử
interface HistoricalSite {
  id: number;
  name: string;
  location: string;
  periodId?: number;
  description: string;
  detailedDescription?: string;
  imageUrl?: string;
  mapUrl?: string;
  address?: string;
  yearBuilt?: string;
  relatedEventId?: number;
  sortOrder: number;
}

interface SortableSiteItemProps {
  site: HistoricalSite;
  onEdit: (site: HistoricalSite) => void;
  onDelete: (site: HistoricalSite) => void;
}

function SortableSiteItem({ site, onEdit, onDelete }: SortableSiteItemProps) {
  const { periods } = useContext(HistoricalSitesContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: site.id });

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white dark:bg-zinc-800 p-4 mb-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="cursor-move" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        <div className="flex-shrink-0 h-12 w-12 relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {site.imageUrl ? (
            <img
              src={site.imageUrl}
              alt={site.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
              <MapPin className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {site.name}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {periods.find((p) => p.id === site.periodId)?.name ||
                "Chưa phân loại"}{" "}
              • {site.location}
            </span>
            {site.mapUrl && (
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Map className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/di-tich/${site.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(site)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(site)}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Định nghĩa interface cho thời kỳ
interface Period {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
  sortOrder: number;
}

// Context với periods
interface HistoricalSitesContextType {
  periods: Period[];
}

const HistoricalSitesContext = createContext<HistoricalSitesContextType>({
  periods: [],
});

export default function HistoricalSitesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sites, setSites] = useState<HistoricalSite[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<HistoricalSite | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<HistoricalSite | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [periodId, setPeriodId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [address, setAddress] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [relatedEventId, setRelatedEventId] = useState<number | undefined>(
    undefined,
  );
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // DnD setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch historical sites and periods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Song song lấy cả hai dữ liệu để tối ưu thời gian
        const [sitesResponse, periodsResponse] = await Promise.all([
          apiRequest("GET", "/api/admin/historical-sites"),
          apiRequest("GET", "/api/admin/periods"),
        ]);

        const sitesData = await sitesResponse.json();
        const periodsData = await periodsResponse.json();

        setSites(sitesData);
        setPeriods(periodsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Site ID array for sorting
  const siteIds = useMemo(() => sites.map((site) => site.id), [sites]);

  // Handle drag end for sorting
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSites((sites) => {
        const oldIndex = sites.findIndex((site) => site.id === active.id);
        const newIndex = sites.findIndex((site) => site.id === over.id);

        const newOrder = arrayMove(sites, oldIndex, newIndex);

        // Update order on server
        updateSortOrder(newOrder.map((site) => site.id));

        return newOrder;
      });
    }
  };

  // Update sort order on server
  const updateSortOrder = async (orderedIds: number[]) => {
    try {
      const response = await apiRequest(
        "POST",
        "/api/admin/historical-sites/reorder",
        { orderedIds },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thứ tự hiển thị",
      });
    } catch (error) {
      console.error("Error updating sort order:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thứ tự hiển thị",
        variant: "destructive",
      });
    }
  };

  // Open add/edit dialog
  const handleOpenDialog = (site: HistoricalSite | null = null) => {
    setCurrentSite(site);
    setDialogOpen(true);

    if (site) {
      // Edit mode
      setIsEditing(true);
      setName(site.name);
      setLocation(site.location);
      setPeriodId(site.periodId);
      setDescription(site.description);
      setDetailedDescription(site.detailedDescription || "");
      setImageUrl(site.imageUrl || "");
      setMapUrl(site.mapUrl || "");
      setAddress(site.address || "");
      setYearBuilt(site.yearBuilt || "");
      setRelatedEventId(site.relatedEventId);
      setPreviewImage(site.imageUrl || "");
      setIsRemovingImage(false);
    } else {
      // Add mode
      setIsEditing(false);
      setName("");
      setLocation("");
      setPeriodId(undefined);
      setDescription("");
      setDetailedDescription("");
      setImageUrl("");
      setMapUrl("");
      setAddress("");
      setYearBuilt("");
      setRelatedEventId(undefined);
      setPreviewImage("");
      setUploadedImage(null);
      setIsRemovingImage(false);
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setCurrentSite(null);
    setIsEditing(false);
    setDialogOpen(false);
  };

  // Xử lý tải lên hình ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImageUrl(""); // Xóa imageUrl khi tải lên

      // Tạo URL tạm thời để hiển thị xem trước
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      try {
        // Tải lên hình ảnh thông qua API mới
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/sites", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Lỗi khi tải lên hình ảnh: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          // Lưu URL của tập tin đã tải lên
          const uploadedUrl = data.url;
          setImageUrl(uploadedUrl); // Lưu URL để sử dụng trong form

          console.log("Tải lên hình ảnh thành công:", uploadedUrl);
        }
      } catch (error) {
        console.error("Lỗi khi tải lên hình ảnh:", error);
        toast({
          title: "Lỗi tải lên",
          description: "Không thể tải lên hình ảnh. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        // Giải phóng URL đối tượng
        URL.revokeObjectURL(objectUrl);
      }

      setIsRemovingImage(false);
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setUploadedImage(null); // Clear uploaded image when using URL
    setPreviewImage(url);
    setIsRemovingImage(false);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setPreviewImage("");
    setImageUrl("");
    setUploadedImage(null);
    setIsRemovingImage(true);
  };

  // Save historical site
  const handleSaveSite = async () => {
    // Validate form
    if (!name || !location || !description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare data
      const siteData: any = {
        name,
        location,
        description,
        detailedDescription: detailedDescription || null,
        periodId: periodId || null,
        mapUrl: mapUrl || null,
        address: address || null,
        yearBuilt: yearBuilt || null,
        relatedEventId: relatedEventId || null,
      };

      // Xử lý hình ảnh
      if (isRemovingImage) {
        siteData.imageUrl = ""; // Empty string to indicate removal
      } else if (imageUrl) {
        // Sử dụng URL đã tải lên hoặc nhập vào
        siteData.imageUrl = imageUrl;
      } else if (isEditing && currentSite) {
        // Giữ nguyên URL hiện tại nếu đang chỉnh sửa và không có thay đổi
        siteData.imageUrl = currentSite.imageUrl;
      } else {
        // Mặc định nếu không có hình ảnh
        siteData.imageUrl = "";
      }

      let response;
      let successMessage;

      if (isEditing && currentSite) {
        // Update existing site
        response = await apiRequest(
          "PUT",
          `/api/admin/historical-sites/${currentSite.id}`,
          siteData,
        );
        successMessage = "Cập nhật địa danh lịch sử thành công";
      } else {
        // Create new site
        response = await apiRequest(
          "POST",
          "/api/admin/historical-sites",
          siteData,
        );
        successMessage = "Thêm địa danh lịch sử thành công";
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save historical site");
      }

      // Refresh sites list
      const refreshResponse = await apiRequest(
        "GET",
        "/api/admin/historical-sites",
      );
      const refreshData = await refreshResponse.json();
      setSites(refreshData);

      // Close dialog and show success message
      handleCloseDialog();
      toast({
        title: "Thành công",
        description: successMessage,
      });
    } catch (error) {
      console.error("Error saving historical site:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu địa danh lịch sử",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (site: HistoricalSite) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteSite = async () => {
    if (!siteToDelete) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/historical-sites/${siteToDelete.id}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete historical site");
      }

      // Remove from state
      setSites(sites.filter((site) => site.id !== siteToDelete.id));

      // Close dialog and show success message
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
      toast({
        title: "Thành công",
        description: "Xóa địa danh lịch sử thành công",
      });
    } catch (error) {
      console.error("Error deleting historical site:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa địa danh lịch sử",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Quản lý địa danh lịch sử">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý địa danh lịch sử</h1>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          Thêm địa danh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-white"></div>
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có địa danh lịch sử nào.
          </p>
          <Button onClick={() => handleOpenDialog()} className="mt-4">
            Thêm địa danh đầu tiên
          </Button>
        </div>
      ) : (
        <HistoricalSitesContext.Provider value={{ periods }}>
          {/* Phân loại theo thời kỳ */}
          <div className="grid gap-6">
            {periods.map((period) => {
              // Lọc địa danh theo thời kỳ
              const periodSites = sites.filter(
                (site) => site.periodId === period.id,
              );

              // Chỉ hiển thị nhóm thời kỳ nếu có địa danh
              if (periodSites.length === 0) return null;

              return (
                <div
                  key={period.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden"
                >
                  {/* Tiêu đề thời kỳ */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 border-b border-blue-100 dark:border-blue-800">
                    <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-100 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200">
                        {periodSites.length}
                      </span>
                      {period.name} ({period.timeframe})
                    </h2>
                  </div>

                  {/* Danh sách địa danh thuộc thời kỳ */}
                  <div className="p-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={periodSites.map((site) => site.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {periodSites.map((site) => (
                          <SortableSiteItem
                            key={site.id}
                            site={site}
                            onEdit={handleOpenDialog}
                            onDelete={handleOpenDeleteDialog}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              );
            })}

            {/* Nhóm địa danh chưa có thời kỳ */}
            {(() => {
              const unassignedSites = sites.filter((site) => !site.periodId);
              if (unassignedSites.length === 0) return null;

              return (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {unassignedSites.length}
                      </span>
                      Chưa phân loại
                    </h2>
                  </div>

                  <div className="p-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={unassignedSites.map((site) => site.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {unassignedSites.map((site) => (
                          <SortableSiteItem
                            key={site.id}
                            site={site}
                            onEdit={handleOpenDialog}
                            onDelete={handleOpenDeleteDialog}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              );
            })()}
          </div>
        </HistoricalSitesContext.Provider>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Chỉnh sửa địa danh lịch sử"
                : "Thêm địa danh lịch sử"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết về địa danh lịch sử. Các trường có dấu *
              là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <div className="mb-4">
                <Label htmlFor="name">Tên địa danh *</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên địa danh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="location">Vị trí *</Label>
                <Input
                  id="location"
                  placeholder="Nhập vị trí địa danh (ví dụ: Hà Nội, Huế...)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="period">Thời kỳ</Label>
                <Select
                  value={periodId?.toString() || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setPeriodId(undefined);
                    } else {
                      const id = parseInt(value);
                      setPeriodId(id);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn thời kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không phân loại</SelectItem>
                    {periods
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((period) => (
                        <SelectItem
                          key={period.id}
                          value={period.id.toString()}
                        >
                          {period.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label htmlFor="yearBuilt">Năm xây dựng</Label>
                <Input
                  id="yearBuilt"
                  placeholder="Nhập năm xây dựng hoặc thành lập"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="address">Địa chỉ chi tiết</Label>
                <Input
                  id="address"
                  placeholder="Nhập địa chỉ chi tiết"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="mapUrl">Đường dẫn bản đồ</Label>
                <Input
                  id="mapUrl"
                  placeholder="Nhập URL Google Maps"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="description">Mô tả ngắn *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn về địa danh"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="mb-4">
                <Label>Hình ảnh</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="imageUrl" className="text-sm text-gray-500">
                      URL hình ảnh
                    </Label>
                    <Input
                      id="imageUrl"
                      placeholder="Nhập URL hình ảnh"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="px-4 py-2 text-sm text-gray-500">hoặc</div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="imageUpload"
                      className="text-sm text-gray-500"
                    >
                      Tải ảnh lên
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {previewImage && (
                    <div className="mt-2">
                      <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => setPreviewImage("")}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          Xóa ảnh
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <Label htmlFor="detailedDescription">Mô tả chi tiết</Label>
                <div className="mt-1">
                  <ReactQuill
                    theme="snow"
                    value={detailedDescription}
                    onChange={setDetailedDescription}
                    placeholder="Thêm mô tả chi tiết về địa danh lịch sử..."
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ indent: "-1" }, { indent: "+1" }],
                        [{ color: [] }, { background: [] }],
                        ["link", "image"],
                        ["clean"],
                      ],
                    }}
                    className="min-h-[400px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveSite}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa danh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa danh "{siteToDelete?.name}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

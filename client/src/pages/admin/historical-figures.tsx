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
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Grid,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  ChevronDown,
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

// Định nghĩa kiểu dữ liệu cho nhân vật lịch sử
interface HistoricalFigure {
  id: number;
  name: string;
  periodId?: number;
  periodText: string; // Tương thích với trường period cũ
  period?: string; // Cho tương thích ngược
  lifespan: string;
  description: string;
  detailedDescription?: string;
  imageUrl: string;
  achievements?: any;
  sortOrder: number;
}

interface SortableFigureItemProps {
  figure: HistoricalFigure;
  onEdit: (figure: HistoricalFigure) => void;
  onDelete: (figure: HistoricalFigure) => void;
}

function SortableFigureItem({
  figure,
  onEdit,
  onDelete,
}: SortableFigureItemProps) {
  const { periods } = useContext(HistoricalFiguresContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: figure.id });

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
          {figure.imageUrl ? (
            <img
              src={figure.imageUrl}
              alt={figure.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
              <Grid className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {figure.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {periods.find((p) => p.id === figure.periodId)?.name ||
              figure.periodText ||
              ""}{" "}
            • {figure.lifespan}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/nhan-vat/${figure.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(figure)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(figure)}
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
interface HistoricalFiguresContextType {
  periods: Period[];
}

const HistoricalFiguresContext = createContext<HistoricalFiguresContextType>({
  periods: [],
});

export default function HistoricalFiguresAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFigure, setCurrentFigure] = useState<HistoricalFigure | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState<HistoricalFigure | null>(
    null,
  );

  // Form state
  const [name, setName] = useState("");
  const [periodId, setPeriodId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState(""); // Giữ lại cho tương thích
  const [lifespan, setLifespan] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // State cho achievements
  const [achievements, setAchievements] = useState<
    Array<{ id: string; title: string; eventId?: number; year?: string }>
  >([]);

  // DnD setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch historical figures and periods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Song song lấy cả ba dữ liệu để tối ưu thời gian
        const [figuresResponse, periodsResponse, eventsResponse] =
          await Promise.all([
            apiRequest("GET", "/api/admin/historical-figures"),
            apiRequest("GET", "/api/admin/periods"),
            apiRequest("GET", "/api/events"),
          ]);

        const figuresData = await figuresResponse.json();
        const periodsData = await periodsResponse.json();
        const eventsData = await eventsResponse.json();

        setFigures(figuresData);
        setPeriods(periodsData);
        setEvents(eventsData);
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

  // Figure ID array for sorting
  const figureIds = useMemo(
    () => figures.map((figure) => figure.id),
    [figures],
  );

  // Handle drag end for sorting
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFigures((figures) => {
        const oldIndex = figures.findIndex((figure) => figure.id === active.id);
        const newIndex = figures.findIndex((figure) => figure.id === over.id);

        const newOrder = arrayMove(figures, oldIndex, newIndex);

        // Update order on server
        updateSortOrder(newOrder.map((figure) => figure.id));

        return newOrder;
      });
    }
  };

  // Update sort order on server
  const updateSortOrder = async (orderedIds: number[]) => {
    try {
      const response = await apiRequest(
        "POST",
        "/api/admin/historical-figures/reorder",
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
  const handleOpenDialog = (figure: HistoricalFigure | null = null) => {
    setCurrentFigure(figure);
    setDialogOpen(true);

    if (figure) {
      // Edit mode
      setIsEditing(true);
      setName(figure.name);
      setPeriodId(figure.periodId);
      setPeriod(
        periods.find((p) => p.id === figure.periodId)?.name ||
          figure.periodText ||
          "",
      ); // Giữ lại tương thích
      setLifespan(figure.lifespan);
      setDescription(figure.description);
      setDetailedDescription(figure.detailedDescription || "");
      setImageUrl(figure.imageUrl);
      setPreviewImage(figure.imageUrl);
      setIsRemovingImage(false);

      // Nạp dữ liệu thành tựu
      if (figure.achievements && Array.isArray(figure.achievements)) {
        setAchievements(figure.achievements);
      } else {
        setAchievements([]);
      }
    } else {
      // Add mode
      setIsEditing(false);
      setName("");
      setPeriodId(undefined);
      setPeriod("");
      setLifespan("");
      setDescription("");
      setDetailedDescription("");
      setImageUrl("");
      setPreviewImage("");
      setUploadedImage(null);
      setIsRemovingImage(false);
      setAchievements([]);
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setCurrentFigure(null);
    setIsEditing(false);
    setDialogOpen(false);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImageUrl(""); // Clear imageUrl when uploading

      // Tạo URL tạm thời để hiển thị xem trước
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      try {
        // Tải lên hình ảnh thông qua API mới
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/figures", {
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

  // Save historical figure
  const handleSaveFigure = async () => {
    // Validate form
    if (!name || (!periodId && !period) || !lifespan || !description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare data
      const figureData: any = {
        name,
        lifespan,
        description,
        detailedDescription: detailedDescription || null,
        achievements: achievements.length > 0 ? achievements : null, // Thêm thành tựu
      };

      // Thêm periodId nếu có
      if (periodId) {
        figureData.periodId = periodId;
      }

      // Giữ lại trường period cho tương thích ngược
      if (period) {
        figureData.period = period;
      }

      // Xử lý hình ảnh
      if (isRemovingImage) {
        figureData.imageUrl = ""; // Empty string to indicate removal
      } else if (imageUrl) {
        // Sử dụng URL đã tải lên hoặc nhập vào
        figureData.imageUrl = imageUrl;
      } else if (isEditing && currentFigure) {
        // Giữ nguyên URL hiện tại nếu đang chỉnh sửa và không có thay đổi
        figureData.imageUrl = currentFigure.imageUrl;
      } else {
        // Mặc định nếu không có hình ảnh
        figureData.imageUrl = "";
      }

      let response;
      let successMessage;

      if (isEditing && currentFigure) {
        // Update existing figure
        response = await apiRequest(
          "PUT",
          `/api/admin/historical-figures/${currentFigure.id}`,
          figureData,
        );
        successMessage = "Cập nhật nhân vật lịch sử thành công";
      } else {
        // Create new figure
        response = await apiRequest(
          "POST",
          "/api/admin/historical-figures",
          figureData,
        );
        successMessage = "Thêm nhân vật lịch sử thành công";
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save historical figure");
      }

      // Refresh figures list
      const refreshResponse = await apiRequest(
        "GET",
        "/api/admin/historical-figures",
      );
      const refreshData = await refreshResponse.json();
      setFigures(refreshData);

      // Close dialog and show success message
      handleCloseDialog();
      toast({
        title: "Thành công",
        description: successMessage,
      });
    } catch (error) {
      console.error("Error saving historical figure:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu nhân vật lịch sử",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (figure: HistoricalFigure) => {
    setFigureToDelete(figure);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteFigure = async () => {
    if (!figureToDelete) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/historical-figures/${figureToDelete.id}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete historical figure");
      }

      // Remove from state
      setFigures(figures.filter((figure) => figure.id !== figureToDelete.id));

      // Close dialog and show success message
      setDeleteDialogOpen(false);
      setFigureToDelete(null);
      toast({
        title: "Thành công",
        description: "Xóa nhân vật lịch sử thành công",
      });
    } catch (error) {
      console.error("Error deleting historical figure:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhân vật lịch sử",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Quản lý nhân vật lịch sử">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhân vật lịch sử</h1>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          Thêm nhân vật
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-white"></div>
        </div>
      ) : figures.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có nhân vật lịch sử nào.
          </p>
          <Button onClick={() => handleOpenDialog()} className="mt-4">
            Thêm nhân vật đầu tiên
          </Button>
        </div>
      ) : (
        <HistoricalFiguresContext.Provider value={{ periods }}>
          {/* Phân loại theo thời kỳ */}
          <div className="grid gap-6">
            {periods.map((period) => {
              // Lọc nhân vật theo thời kỳ
              const periodFigures = figures.filter(
                (figure) => figure.periodId === period.id,
              );

              // Chỉ hiển thị nhóm thời kỳ nếu có nhân vật
              if (periodFigures.length === 0) return null;

              return (
                <div
                  key={period.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden"
                >
                  {/* Tiêu đề thời kỳ */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 border-b border-blue-100 dark:border-blue-800">
                    <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-100 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200">
                        {periodFigures.length}
                      </span>
                      {period.name} ({period.timeframe})
                    </h2>
                  </div>

                  {/* Danh sách nhân vật thuộc thời kỳ */}
                  <div className="p-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={periodFigures.map((fig) => fig.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {periodFigures.map((figure) => (
                          <SortableFigureItem
                            key={figure.id}
                            figure={figure}
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

            {/* Nhóm nhân vật chưa có thời kỳ */}
            {(() => {
              const unassignedFigures = figures.filter(
                (figure) => !figure.periodId,
              );
              if (unassignedFigures.length === 0) return null;

              return (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {unassignedFigures.length}
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
                        items={unassignedFigures.map((fig) => fig.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {unassignedFigures.map((figure) => (
                          <SortableFigureItem
                            key={figure.id}
                            figure={figure}
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
        </HistoricalFiguresContext.Provider>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Chỉnh sửa nhân vật lịch sử"
                : "Thêm nhân vật lịch sử"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết về nhân vật lịch sử. Các trường có dấu *
              là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <div className="mb-4">
                <Label htmlFor="name">Tên nhân vật *</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên nhân vật"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="period">Thời kỳ *</Label>
                <Select
                  value={periodId?.toString()}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setPeriodId(undefined);
                      setPeriod("");
                    } else {
                      const id = parseInt(value);
                      setPeriodId(id);
                      // Cập nhật cả giá trị period cho tương thích ngược
                      const selectedPeriod = periods.find((p) => p.id === id);
                      if (selectedPeriod) {
                        setPeriod(selectedPeriod.name);
                      }
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
                <Label htmlFor="lifespan">Thời gian sống *</Label>
                <Input
                  id="lifespan"
                  placeholder="Năm sinh - năm mất (ví dụ: 1028 - 1105)"
                  value={lifespan}
                  onChange={(e) => setLifespan(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="description">Mô tả ngắn *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn về nhân vật"
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
                  <RichTextEditor
                    value={detailedDescription}
                    onChange={setDetailedDescription}
                    placeholder="Thêm mô tả chi tiết về nhân vật lịch sử..."
                    height={400}
                    label=""
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="achievements">Thành tựu nổi bật</Label>
                <div className="mt-3 space-y-3 border rounded-md p-4 bg-gray-50 dark:bg-zinc-900">
                  {achievements.map((achievement, index) => (
                    <div
                      key={achievement.id || index}
                      className="grid grid-cols-12 gap-2"
                    >
                      <Input
                        placeholder="Tên thành tựu"
                        value={achievement.title}
                        onChange={(e) => {
                          const newAchievements = [...achievements];
                          newAchievements[index].title = e.target.value;
                          setAchievements(newAchievements);
                        }}
                        className="col-span-5"
                      />
                      <Input
                        placeholder="Năm (nếu có)"
                        value={achievement.year || ""}
                        onChange={(e) => {
                          const newAchievements = [...achievements];
                          newAchievements[index].year = e.target.value;
                          setAchievements(newAchievements);
                        }}
                        className="col-span-2"
                      />
                      <Select
                        value={achievement.eventId?.toString() || "none"}
                        onValueChange={(value) => {
                          const newAchievements = [...achievements];
                          newAchievements[index].eventId =
                            value !== "none" ? parseInt(value) : undefined;
                          setAchievements(newAchievements);
                        }}
                      >
                        <SelectTrigger className="col-span-4">
                          <SelectValue placeholder="Liên kết sự kiện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Không có sự kiện</SelectItem>
                          {events.map((event) => (
                            <SelectItem
                              key={event.id}
                              value={event.id.toString()}
                            >
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newAchievements = [...achievements];
                          newAchievements.splice(index, 1);
                          setAchievements(newAchievements);
                        }}
                        className="col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setAchievements([
                        ...achievements,
                        {
                          id: Date.now().toString(),
                          title: "",
                          year: "",
                          eventId: undefined,
                        },
                      ]);
                    }}
                  >
                    Thêm thành tựu
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveFigure}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân vật lịch sử "{figureToDelete?.name}
              "? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFigure}
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

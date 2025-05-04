import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MoveUpIcon, CheckSquare, Eye, MessageSquare } from 'lucide-react';

interface Feedback {
  id: number;
  name: string;
  phone: string;
  email: string;
  content: string;
  resolved: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export default function FeedbackManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  
  // Fetch all feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/admin/feedback');
        const data = await response.json();
        setFeedbacks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách góp ý',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [toast]);
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Handle view feedback
  const handleViewFeedback = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setViewDialogOpen(true);
  };
  
  // Handle reply to feedback
  const handleOpenReplyDialog = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setResponseText(feedback.response || '');
    setReplyDialogOpen(true);
  };
  
  // Submit reply
  const handleSubmitReply = async () => {
    if (!currentFeedback) return;
    
    try {
      const response = await apiRequest('PUT', `/api/admin/feedback/${currentFeedback.id}`, {
        resolved: true,
        response: responseText
      });
      
      const data = await response.json();
      
      // Update the feedbacks list
      setFeedbacks(prev => 
        prev.map(f => f.id === currentFeedback.id ? data.feedback : f)
      );
      
      setReplyDialogOpen(false);
      setCurrentFeedback(null);
      setResponseText('');
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái góp ý',
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái góp ý',
        variant: 'destructive',
      });
    }
  };
  
  // Mark feedback as resolved without reply
  const handleMarkResolved = async (feedback: Feedback) => {
    try {
      const response = await apiRequest('PUT', `/api/admin/feedback/${feedback.id}`, {
        resolved: true,
        response: feedback.response || 'Đã xử lý'
      });
      
      const data = await response.json();
      
      // Update the feedbacks list
      setFeedbacks(prev => 
        prev.map(f => f.id === feedback.id ? data.feedback : f)
      );
      
      toast({
        title: 'Thành công',
        description: 'Đã đánh dấu góp ý là đã xử lý',
      });
    } catch (error) {
      console.error('Error marking feedback as resolved:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái góp ý',
        variant: 'destructive',
      });
    }
  };
  
  // Truncate text
  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <AdminLayout title="Quản lý góp ý">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý góp ý</h1>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Refresh feedback list
                    setLoading(true);
                    apiRequest('GET', '/api/admin/feedback')
                      .then(res => res.json())
                      .then(data => {
                        setFeedbacks(data);
                        setLoading(false);
                      })
                      .catch(err => {
                        console.error(err);
                        setLoading(false);
                        toast({
                          title: 'Lỗi',
                          description: 'Không thể tải danh sách góp ý',
                          variant: 'destructive',
                        });
                      });
                  }}
                >
                  <MoveUpIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tải lại danh sách</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Badge variant="outline" className="ml-2">
            {feedbacks.filter(f => !f.resolved).length} chưa xử lý
          </Badge>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 dark:border-white"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Chưa có góp ý nào.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Danh sách góp ý từ người dùng</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Người gửi</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback, index) => (
                <TableRow 
                  key={feedback.id}
                  className={feedback.resolved ? '' : 'bg-yellow-50 dark:bg-zinc-700/30'}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{feedback.name}</TableCell>
                  <TableCell>
                    <div>Email: {feedback.email}</div>
                    <div>SĐT: {feedback.phone}</div>
                  </TableCell>
                  <TableCell>{truncateText(feedback.content)}</TableCell>
                  <TableCell>{formatDate(feedback.createdAt)}</TableCell>
                  <TableCell>
                    {feedback.resolved ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                        Đã xử lý
                        {feedback.respondedAt && <span className="block text-xs mt-1">
                          {formatDate(feedback.respondedAt)}
                        </span>}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
                        Chưa xử lý
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewFeedback(feedback)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {!feedback.resolved && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleOpenReplyDialog(feedback)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Phản hồi</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleMarkResolved(feedback)}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đánh dấu đã xử lý</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết góp ý</DialogTitle>
          </DialogHeader>
          
          {currentFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Người gửi:</div>
                <div className="col-span-2">{currentFeedback.name}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Email:</div>
                <div className="col-span-2">{currentFeedback.email}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Số điện thoại:</div>
                <div className="col-span-2">{currentFeedback.phone}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Thời gian gửi:</div>
                <div className="col-span-2">{formatDate(currentFeedback.createdAt)}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Trạng thái:</div>
                <div className="col-span-2">
                  {currentFeedback.resolved ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Đã xử lý
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Chưa xử lý
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold">Nội dung:</div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                  {currentFeedback.content}
                </div>
              </div>
              
              {currentFeedback.response && (
                <div className="space-y-2">
                  <div className="font-semibold">Phản hồi:</div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md whitespace-pre-wrap">
                    {currentFeedback.response}
                  </div>
                  
                  {currentFeedback.respondedAt && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Đã phản hồi vào: {formatDate(currentFeedback.respondedAt)}
                    </div>
                  )}
                </div>
              )}
              
              {!currentFeedback.resolved && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleOpenReplyDialog(currentFeedback)}>Phản hồi</Button>
                  <Button onClick={() => handleMarkResolved(currentFeedback)}>Đánh dấu đã xử lý</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi góp ý</DialogTitle>
            <DialogDescription>
              Nhập nội dung phản hồi cho góp ý từ {currentFeedback?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-semibold">Nội dung góp ý:</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                {currentFeedback?.content}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-semibold">Nội dung phản hồi:</div>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmitReply}>Gửi phản hồi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

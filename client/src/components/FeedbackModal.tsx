import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự')
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      content: ''
    }
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Thành công',
          description: result.message || 'Góp ý của bạn đã được gửi thành công!',
        });
        form.reset();
        onClose();
      } else {
        toast({
          title: 'Lỗi',
          description: result.error || 'Có lỗi xảy ra khi gửi góp ý',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi gửi góp ý',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Góp ý xây dựng</DialogTitle>
          <DialogDescription className="text-center">
            Hãy chia sẻ ý kiến của bạn để chúng tôi có thể cải thiện website tốt hơn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0909123456" {...field} />
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
                    <Input placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung góp ý</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nhập nội dung góp ý của bạn tại đây..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi góp ý'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
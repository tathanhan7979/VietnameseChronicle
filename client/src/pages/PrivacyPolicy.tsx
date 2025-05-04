import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyPolicyData {
  value: string;
}

export default function PrivacyPolicy() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/privacy_policy');
        
        if (!response.ok) {
          throw new Error('Failed to fetch privacy policy');
        }
        
        const data = await response.json();
        setContent(data.value || '<p>Nội dung chính sách bảo mật đang được cập nhật.</p>');
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải chính sách bảo mật');
        console.error('Error fetching privacy policy:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1A237E] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display']">Chính sách bảo mật</h1>
          <p className="mt-4 text-indigo-200">Thông tin về cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </div>
  );
}

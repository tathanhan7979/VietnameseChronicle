import { ReactNode } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    console.log('Toast:', options);
    // Thực tế sẽ thêm toast vào queue
  };

  return { toast };
}
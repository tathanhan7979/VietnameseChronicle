import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ToastErrorProps {
  status?: number;
  title: string;
  message: string;
  onClose?: () => void;
}

export function ToastError({ status, title, message, onClose }: ToastErrorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 max-w-md w-full">
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-destructive p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {title}
                {status && <span className="ml-2 text-gray-500">({status})</span>}
              </p>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  // Chuyển chuỗi sang lower case
  const str = text.toLowerCase()
    // Xử lý các ký tự đặc biệt tiếng Việt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Thay thế các ký tự đặc biệt và khoảng trắng bằng gạch ngang
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return str;
}

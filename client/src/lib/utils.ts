import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function slugify(text: string): string {
  if (!text) return "";
  
  // Chuyển chuỗi sang lower case
  let str = text.toLowerCase()
    // Xử lý các ký tự đặc biệt tiếng Việt
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    // Đối với chữ hoa
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "a")
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "e")
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "i")
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "o")
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "u")
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "y")
    .replace(/Đ/g, "d");
  
  // Chuyển các ký tự đặc biệt như dấu gạch ngang (-) trong tên thành khoảng trắng
  str = str.replace(/[\-_]/g, " ");
  
  // Loại bỏ các ký tự không phải chữ cái, số hoặc khoảng trắng
  str = str.replace(/[^a-z0-9\s]/g, "");
  
  // Thay thế nhiều khoảng trắng bằng một khoảng trắng
  str = str.replace(/\s+/g, " ").trim();
  
  // Thay thế khoảng trắng bằng dấu gạch ngang
  str = str.replace(/\s/g, "-");
  
  return str;
}

#!/bin/bash

# Tạo thư mục uploads trong Next.js nếu chưa tồn tại
mkdir -p nextapp/public/uploads

# Sao chép các file uploads từ thư mục gốc sang Next.js
echo "Sao chép files uploads..."
cp -r uploads/* nextapp/public/uploads/ 2>/dev/null || echo "Không có files uploads để sao chép"

# Sao chép các file cần thiết từ Server API
echo "Sao chép các file cần thiết từ Server API..."

# Dừng cả hai server nếu đang chạy
echo "Dừng các server đang chạy..."
pkill -f "tsx server/index.ts" || true
pkill -f "next" || true

# Khởi động Next.js
echo "Khởi động ứng dụng Next.js..."
cd nextapp && npm run dev
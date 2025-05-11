#!/bin/bash

echo "Dừng server React hiện tại..."
# Thực hiện lệnh để dừng server (có thể cần điều chỉnh)
pkill -f "tsx server/index.ts" || true

echo "Chuẩn bị khởi động Next.js..."
cd nextapp || { echo "Thư mục nextapp không tồn tại!"; exit 1; }

# Kiểm tra và cài đặt dependencies nếu cần
if [ ! -d "node_modules" ]; then
  echo "Cài đặt dependencies cho Next.js..."
  npm install
fi

# Khởi động Next.js
echo "Khởi động Next.js..."
npm run dev
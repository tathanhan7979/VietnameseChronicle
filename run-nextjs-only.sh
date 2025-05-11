#!/bin/bash

# Thiết lập môi trường
echo "Thiết lập môi trường cho Next.js..."

# Kiểm tra xem đã cài đặt Next.js chưa
if ! grep -q "next" nextapp/package.json 2>/dev/null; then
  echo "Cài đặt Next.js và các dependencies..."
  cd nextapp
  npm install next@latest react@latest react-dom@latest @tanstack/react-query@latest
  cd ..
fi

# Tạo file .env.local trong thư mục nextapp nếu chưa tồn tại
if [ ! -f nextapp/.env.local ]; then
  echo "Tạo file .env.local..."
  cp .env nextapp/.env.local 2>/dev/null || echo "DATABASE_URL=${DATABASE_URL}" > nextapp/.env.local
  echo "NEXTAUTH_SECRET=lichsuviet_migration_secret" >> nextapp/.env.local
  echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> nextapp/.env.local
fi

# Chạy Next.js development server
echo "Khởi động Next.js development server..."
cd nextapp
npm run dev
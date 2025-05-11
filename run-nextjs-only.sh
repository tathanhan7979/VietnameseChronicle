#!/bin/bash

echo "=== Vietnamese Chronicle: Chuyển đổi sang Next.js ==="

# Kiểm tra thư mục shared và schema.ts
if [ ! -d "nextapp/shared" ]; then
  echo "Tạo thư mục shared trong nextapp..."
  mkdir -p nextapp/shared
fi

# Sao chép shared schema
if [ -f "shared/schema.ts" ]; then
  echo "Sao chép schema từ shared/ sang nextapp/shared/..."
  cp -f shared/schema.ts nextapp/shared/
else
  echo "CẢNH BÁO: Không tìm thấy shared/schema.ts"
fi

# Kiểm tra thư mục db và index.ts
if [ ! -d "nextapp/db" ]; then
  echo "Tạo thư mục db trong nextapp..."
  mkdir -p nextapp/db
fi

# Sao chép db setup
if [ -f "db/index.ts" ]; then
  echo "Sao chép index.ts từ db/ sang nextapp/db/..."
  cp -f db/index.ts nextapp/db/
else
  echo "CẢNH BÁO: Không tìm thấy db/index.ts"
fi

# Kiểm tra thư mục server
if [ ! -d "nextapp/server" ]; then
  echo "Tạo thư mục server trong nextapp..."
  mkdir -p nextapp/server
fi

# Sao chép server/auth.ts
if [ -f "server/auth.ts" ]; then
  echo "Sao chép auth.ts từ server/ sang nextapp/server/..."
  cp -f server/auth.ts nextapp/server/
else
  echo "CẢNH BÁO: Không tìm thấy server/auth.ts"
fi

# Tạo thư mục uploads trong Next.js nếu chưa tồn tại
mkdir -p nextapp/public/uploads

# Sao chép các file uploads từ thư mục gốc sang Next.js
echo "Sao chép files uploads..."
cp -r uploads/* nextapp/public/uploads/ 2>/dev/null || echo "Không có files uploads để sao chép"

# Dừng cả hai server nếu đang chạy
echo "Dừng các server đang chạy..."
pkill -f "tsx server/index.ts" || true
pkill -f "next" || true

# Khởi động Next.js
echo "Khởi động ứng dụng Next.js..."
cd nextapp && npm run dev
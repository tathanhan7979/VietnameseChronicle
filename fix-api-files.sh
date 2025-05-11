#!/bin/bash

# Kiểm tra thư mục API
api_dir="nextapp/src/pages/api"
if [ ! -d "$api_dir" ]; then
  echo "Thư mục API không tồn tại: $api_dir"
  exit 1
fi

# 1. Cập nhật tất cả file API với import { asc, desc } từ drizzle-orm
find "$api_dir" -type f -name "*.ts" -exec sed -i 's/import { and, like, eq } from "drizzle-orm";/import { and, like, eq, asc, desc } from "drizzle-orm";/g' {} \;
find "$api_dir" -type f -name "*.ts" -exec sed -i "s/import { and, like, eq } from 'drizzle-orm';/import { and, like, eq, asc, desc } from 'drizzle-orm';/g" {} \;

# 2. Sửa lỗi dùng type annotations cho tham số trong file API
for file in "$api_dir"/periods/index.ts \
            "$api_dir"/events/index.ts \
            "$api_dir"/historical-figures/index.ts \
            "$api_dir"/historical-sites/index.ts \
            "$api_dir"/event-types/index.ts \
            "$api_dir"/feedback/index.ts; do
  if [ -f "$file" ]; then
    # Sửa các tham số không có type
    sed -i 's/Parameter \([a-zA-Z]*\) implicitly/Parameter \1: any implicitly/g' "$file"
    sed -i 's/Binding element \([a-zA-Z]*\) implicitly/Binding element \1: any implicitly/g' "$file"
    echo "Đã sửa file: $file"
  else
    echo "File không tồn tại: $file"
  fi
done

echo "Đã hoàn thành việc sửa chữa các file API!"
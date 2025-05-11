#!/bin/bash

# Danh sách thư mục API cần cập nhật
api_folders=(
  "nextapp/src/pages/api/periods"
  "nextapp/src/pages/api/events"
  "nextapp/src/pages/api/historical-figures"
  "nextapp/src/pages/api/historical-sites"
  "nextapp/src/pages/api/event-types"
  "nextapp/src/pages/api/settings"
  "nextapp/src/pages/api/auth"
  "nextapp/src/pages/api/feedback"
)

# Duyệt qua từng thư mục
for folder in "${api_folders[@]}"; do
  # Tìm tất cả các file TypeScript trong thư mục
  files=$(find "$folder" -name "*.ts")
  
  # Cập nhật import paths trong từng file
  for file in $files; do
    # Thay thế các import path
    sed -i 's|from "../../../../db"|from "@db"|g' "$file"
    sed -i "s|from '../../../../db'|from '@db'|g" "$file"
    sed -i 's|from "../../../../shared/schema"|from "@shared/schema"|g' "$file"
    sed -i "s|from '../../../../shared/schema'|from '@shared/schema'|g" "$file"
    sed -i 's|from "../../../../server/auth"|from "@server/auth"|g' "$file"
    sed -i "s|from '../../../../server/auth'|from '@server/auth'|g" "$file"
    echo "Đã cập nhật: $file"
  done
done

echo "Đã cập nhật xong tất cả các import!"
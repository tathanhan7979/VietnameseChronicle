#!/bin/bash

# === Thông tin cấu hình PostgreSQL ===
DB_NAME="vietnamese_chronicle"
DB_USER="tathanhangroup"
DB_PASSWORD="Hihihaha123!"
BACKUP_FILE="/root/backup_$(date +%F).sql"

# === Thông tin cấu hình Telegram ===
BOT_TOKEN="7739857322:AAGjqURU0HmrBC7Xw6sRMLPoyw5LIEcU0vE"   # ← Thay bằng token của bot
CHAT_ID="-1002513693228"                # ← Thay bằng chat ID của bạn

# === Export password để pg_dump không hỏi ===
export PGPASSWORD=$DB_PASSWORD

# === Backup cơ sở dữ liệu ===
pg_dump -U $DB_USER -F c $DB_NAME > "$BACKUP_FILE"

# === Gửi file backup tới Telegram ===
curl -F document=@"$BACKUP_FILE" "https://api.telegram.org/bot$BOT_TOKEN/sendDocument?chat_id=$CHAT_ID&caption=📦 Backup PostgreSQL - $(date +%F)"

# === Xóa file sau khi gửi (nếu muốn giữ thì comment dòng dưới) ===
rm "$BACKUP_FILE"

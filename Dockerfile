# Base image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Cài đặt các gói phụ thuộc global
RUN apk add --no-cache python3 make g++ curl

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Đảm bảo thư mục uploads tồn tại
RUN mkdir -p uploads

# Đặt quyền truy cập cho thư mục uploads
RUN chmod -R 777 uploads

# Tạo file environment từ .env.example nếu tồn tại
RUN if [ -f .env.example ]; then cp .env.example .env; fi

# Mở cổng
EXPOSE 5000

# Khởi động ứng dụng
CMD ["npm", "run", "start"]

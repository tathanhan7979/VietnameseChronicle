# client/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json từ thư mục gốc
COPY ../../package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve bằng một web server nhỏ gọn (nếu cần)
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]

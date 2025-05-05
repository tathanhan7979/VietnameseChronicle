# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json từ thư mục gốc
COPY ../package*.json ./
RUN npm install

COPY . .

RUN npm run build
CMD ["node", "dist/index.js"]

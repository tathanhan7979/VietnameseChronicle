
# Base image
FROM node:18-alpine

# Create working directory
WORKDIR /app

# Install global dependencies 
RUN apk add --no-cache python3 make g++ curl openssl ca-certificates

# Update SSL certificates for Neon PostgreSQL
RUN update-ca-certificates

# Copy package files
COPY package*.json ./

# Install dependencies and build
RUN npm install
RUN npm run build

# Copy source code
COPY . .

# Create uploads directory with permissions
RUN mkdir -p uploads
RUN chmod -R 777 uploads

# Create env file from example if exists
RUN if [ -f .env.example ]; then cp .env.example .env; fi

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "run", "start"]

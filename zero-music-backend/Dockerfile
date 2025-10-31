# Base image
FROM node:22-alpine

# Làm thư mục làm việc
WORKDIR /app

# Copy package.json và cài dependencies
COPY package*.json ./
RUN npm install --production

# Copy toàn bộ code
COPY . .

# Expose port backend
EXPOSE 5000

# Chạy server
CMD ["node", "app.js"]

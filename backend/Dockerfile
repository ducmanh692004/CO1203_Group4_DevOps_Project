# ===========================================
# STUDENT TODO: Create a Multi-Stage Dockerfile
# ===========================================
#
# Requirements:
# 1. Stage 1 (builder):
#    - Use node:18-alpine as base
#    - Set working directory
#    - Copy package files and install ALL dependencies
#    - Copy source code
#
# 2. Stage 2 (production):
#    - Use node:18-alpine as base
#    - Set working directory
#    - Copy only package files from builder
#    - Install ONLY production dependencies (hint: --only=production)
#    - Copy application code from builder
#    - Expose the correct port
#    - Set the start command
#
# Hints:
# - Research: "Docker multi-stage build Node.js"
# - Use COPY --from=builder to copy between stages
# - Final image should be as small as possible
# ===========================================

# YOUR CODE HERE:
# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy các file package để cài đặt dependencies
COPY package*.json ./

# Cài đặt TẤT CẢ dependencies (bao gồm cả devDependencies để chạy test nếu cần)
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# --- Stage 2: Production ---
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files từ stage builder sang
COPY --from=builder /app/package*.json ./

# Chỉ cài đặt các dependencies cần thiết cho production (loại bỏ devDependencies)
RUN npm ci --only=production

# Copy mã nguồn đã được xử lý từ stage builder
COPY --from=builder /app ./

# Mở port 8080
EXPOSE 8080

# Lệnh khởi chạy ứng dụng
CMD ["node", "server.js"]
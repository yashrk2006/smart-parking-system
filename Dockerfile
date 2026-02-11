# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Runtime Stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev

# Install tsx globally for production server
RUN npm install -g tsx

# Copy built assets and server code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

# Create directory for SQLite database (mount volume here)
RUN mkdir -p /data
ENV DB_PATH=/data/smart_parking.db

# Expose port
EXPOSE 3000

# Start server
CMD ["tsx", "server.ts"]

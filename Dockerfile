# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Install dependencies (including dev deps for build)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Prune to production dependencies only (re-using the build tools)
RUN npm prune --production

# Runtime Stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies (we need tsx globally)
RUN npm install -g tsx

# Copy node_modules from builder (pre-compiled native modules!)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

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

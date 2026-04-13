# Multi-stage Dockerfile for Eventio 3.0
# Stage 1: Build all frontend applications
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Build arg for API server address (baked into Vite builds at build time)
ARG VITE_APP_SERVER_ADDRESS=""
ENV VITE_APP_SERVER_ADDRESS=$VITE_APP_SERVER_ADDRESS

# Copy package files for all frontend apps
COPY frontend/student/package*.json ./frontend/student/
COPY frontend/council/package*.json ./frontend/council/
COPY frontend/dean/package*.json ./frontend/dean/

# Install dependencies for all apps
RUN cd frontend/student && npm i
RUN cd frontend/council && npm i
RUN cd frontend/dean && npm i

# Copy source code for all apps
COPY frontend/student/ ./frontend/student/
COPY frontend/council/ ./frontend/council/
COPY frontend/dean/ ./frontend/dean/

# Build all frontend applications
RUN cd frontend/student && npm run build
RUN cd frontend/council && npm run build
RUN cd frontend/dean && npm run build

# Stage 2: Nginx server
FROM nginx:alpine

# Install necessary packages
RUN apk add --no-cache curl

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html/council
RUN mkdir -p /usr/share/nginx/html/dean

# Copy built applications to nginx directories
COPY --from=builder /app/frontend/student/dist /usr/share/nginx/html/
COPY --from=builder /app/frontend/council/dist /usr/share/nginx/html/council/
COPY --from=builder /app/frontend/dean/dist /usr/share/nginx/html/dean/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/v1/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

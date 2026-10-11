# Multi-stage production build for CarePilot AI React Frontend
# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm install

# Copy application source
COPY . .

# Build argument for API base URL (empty defaults to /api/v1 proxied by Nginx)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# Stage 2: Serve via Nginx Alpine
FROM nginx:1.27-alpine

# Remove default nginx welcome site
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration with SPA fallback and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check verifying web server responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

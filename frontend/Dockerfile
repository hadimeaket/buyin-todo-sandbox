# =============================================================================
# Build Stage
# =============================================================================
FROM node:20-alpine AS builder

# Add build metadata
ARG BUILD_DATE
ARG VCS_REF
ARG NODE_VERSION=20.19.5

LABEL org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.title="BuyIn Todo Frontend" \
      org.opencontainers.image.description="Frontend UI for BuyIn Todo Application" \
      org.opencontainers.image.source="https://github.com/hadimeaket/buyin-todo-sandbox"

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy TypeScript config and source code
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

# Accept build arguments for environment
ARG NODE_ENV=production
ARG VITE_API_BASE_URL=http://localhost:4000

# Set build environment variables
ENV NODE_ENV=$NODE_ENV \
    VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# =============================================================================
# Production Stage - Nginx
# =============================================================================
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app

# Copy built assets from builder stage
COPY --from=builder --chown=nginx-app:nginx-app /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

# Create nginx cache directory with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-app:nginx-app /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER nginx-app

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Use Node LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install dev dependencies for building
RUN npm install --save-dev typescript

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose the backend port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
COPY . .

# Expose port
EXPOSE 8002

# Start the server
CMD ["node", "simple-rag-server.js"]
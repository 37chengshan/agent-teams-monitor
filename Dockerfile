FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install

# Build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]

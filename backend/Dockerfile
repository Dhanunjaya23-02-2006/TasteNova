FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]

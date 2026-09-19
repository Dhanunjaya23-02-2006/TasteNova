# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# You can pass VITE_API_URL as a build arg in CI/CD
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Step 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments for Vite
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL

# Set them as environment variables for the build process
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

# Copy the dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build
COPY . .
RUN npm run build

# Step 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

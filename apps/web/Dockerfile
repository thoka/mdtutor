# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Build arguments
ARG VITE_SSO_URL
ENV VITE_SSO_URL=$VITE_SSO_URL
ARG VITE_COMMIT_HASH
ENV VITE_COMMIT_HASH=$VITE_COMMIT_HASH

# Dummy ports for the build process (only needed to satisfy vite.config.ts)
ENV WEB_PORT=80
ENV API_PORT=3101

# Copy root package files
COPY package.json package-lock.json ./

# Copy package files for the workspaces
COPY apps/web/package.json apps/web/
COPY packages/parser/package.json packages/parser/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/web apps/web
COPY packages/parser packages/parser

# Build the web app
WORKDIR /app/apps/web
# Remove broken symlinks in public/ that might point to host directories
RUN rm -rf public/content public/snapshots && mkdir -p public/content public/snapshots
RUN npm run build

# Final stage
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy a simple nginx config if needed, or use default
# The default nginx config serves on port 80

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


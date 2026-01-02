FROM node:20-slim

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy package files for the workspace
COPY packages/api-server/package.json packages/api-server/
COPY packages/parser/package.json packages/parser/

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

# Install dependencies
RUN npm install

# Copy source code
COPY packages/api-server packages/api-server
COPY packages/parser packages/parser

# Expose the API port
EXPOSE 3101

# Run the server
WORKDIR /app/packages/api-server
CMD ["npm", "start"]


# Stage 1: Build the static site
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npx next export

# Stage 2: Serve with http-server
FROM node:18-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/out ./out
EXPOSE 9098
CMD ["http-server", "out", "-p", "9098", "-c-1"] 
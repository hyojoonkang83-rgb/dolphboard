# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.15.0

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/client
RUN pnpm build

# Production stage
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

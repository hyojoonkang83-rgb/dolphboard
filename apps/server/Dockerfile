# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.15.0

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/server
RUN pnpm build 2>/dev/null || true

# Production stage
FROM node:20-alpine AS runner

RUN npm install -g pnpm@9.15.0

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/server

EXPOSE 3000 1234

CMD ["node", "--import", "tsx/esm", "src/index.ts"]

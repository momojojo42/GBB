# ============================================================================
# Stage 1: Build Vite 3D Application Bundle
# ============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html admin.html vite.config.js ./
COPY src ./src
COPY public ./public
COPY assets ./assets
COPY scripts/server ./scripts/server

RUN npm run build

# ============================================================================
# Stage 2: Lightweight Production HTTP + Multiplayer WebSocket Server
# ============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY package.json ./
COPY server.js ./
COPY scripts/server ./scripts/server
COPY --from=builder /app/dist ./dist
COPY assets ./assets

EXPOSE 8080

CMD ["node", "server.js"]

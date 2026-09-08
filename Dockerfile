# =========================
# DEPENDENCIES
# =========================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# =========================
# BUILD
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN mkdir -p public

RUN npm run build


# =========================
# RUNTIME
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public

COPY --from=builder --chown=node:node /app/.next/standalone ./

COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
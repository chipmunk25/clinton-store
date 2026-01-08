# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ✅ Install Pnpm Manually Instead of Using Corepack
RUN npm install -g pnpm@latest

# Copy dependency files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# ✅ Install dependencies using the manually installed Pnpm
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL
ARG AUTH_SECRET

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}



# Ensure Pnpm is installed in the builder stage as well
RUN npm install -g pnpm@latest

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ Build the Next.js application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ✅ Start the Next.js application
CMD ["node", "server.js"]
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install additional dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with clean npm install to avoid cache issues
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG ESLINT_SKIP=true
ARG NEXT_ESLINT_SKIP_VALIDATION=1

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application with type checking and linting disabled
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
ENV ESLINT_SKIP=${ESLINT_SKIP}
ENV NEXT_ESLINT_SKIP_VALIDATION=${NEXT_ESLINT_SKIP_VALIDATION}
ENV TS_SKIP_TYPECHECK=true

# Build with maximum Node memory available
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install wget for healthcheck and additional dependencies
RUN apk add --no-cache wget curl libc6-compat

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions for mounted volume
RUN mkdir -p /app/public && chown -R nextjs:nodejs /app/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check to ensure container is running correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"] 
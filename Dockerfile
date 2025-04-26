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
ARG NODE_ENV=production

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application with type checking and linting disabled
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
ENV ESLINT_SKIP=${ESLINT_SKIP}
ENV NEXT_ESLINT_SKIP_VALIDATION=${NEXT_ESLINT_SKIP_VALIDATION}
ENV TS_SKIP_TYPECHECK=true
ENV NODE_ENV=${NODE_ENV}

# Build with maximum Node memory available
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install necessary tools and dependencies
RUN apk add --no-cache wget curl libc6-compat tini

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions for mounted volume
RUN mkdir -p /app/public && chown -R nextjs:nodejs /app/public

# Create log directory for AWS CloudWatch logs
RUN mkdir -p /var/log/app && chown -R nextjs:nodejs /var/log/app

# Switch to non-root user
USER nextjs

# Set environment variables for the application
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Health check for container orchestration (ECS/ELB)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Use tini as init to properly handle signals
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"] 
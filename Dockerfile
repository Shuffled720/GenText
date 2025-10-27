FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy all source code
COPY . .

# Build the Next.js app
RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Expose the port
EXPOSE 3000

# Run Next.js app
CMD ["yarn", "start"]

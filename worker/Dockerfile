FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev

FROM base AS builder
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

ENV NODE_ENV=production

CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"]

# STAGE 1

FROM node:24.2.0-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm install

COPY . . 

RUN npm run build

# STAGE 2

FROM node:24.2.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
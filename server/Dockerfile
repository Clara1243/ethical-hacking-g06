FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci

COPY server/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]

FROM node:20-alpine

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=optional
COPY shared /app/shared
COPY server/src ./src

EXPOSE 4000
CMD ["npm", "run", "dev"]

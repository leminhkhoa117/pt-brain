FROM node:20-alpine

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY shared /app/shared
COPY client ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

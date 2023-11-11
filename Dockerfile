FROM node:18-alpine

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npm run build
RUN chmod +x scripts/start.sh
CMD ["scripts/start.sh"]

FROM node:20-alpine

RUN apk add --no-cache git docker-cli docker-cli-compose \
 && git config --global --add safe.directory '*'

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "run", "start"]

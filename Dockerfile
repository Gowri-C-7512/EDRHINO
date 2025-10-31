FROM node:20-alpine AS build

WORKDIR /app

COPY package.json /app

COPY .npmrc /app

RUN npm install

RUN npm install -g pm2

COPY . /app

RUN npm run build

EXPOSE 5000

CMD [ "pm2-runtime", "npm", "--", "start" ]
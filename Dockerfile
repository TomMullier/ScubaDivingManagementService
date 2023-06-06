FROM node:latest

WORKDIR /app

COPY package*.json .

RUN npm install
RUN npm i -g nodemon

COPY . .

CMD ["nodemon", "."]
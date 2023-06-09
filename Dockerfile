FROM node:latest

WORKDIR /app

# Set timezone
ENV TZ=Europe/Paris
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends tzdata && apt-get clean

COPY package*.json .

RUN npm install
RUN npm i -g nodemon

COPY . .

CMD ["nodemon", "--legacy-watch", "."]
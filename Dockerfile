# Lets start with the default node LTS image
FROM node:boron
MAINTAINER thomas@malt.no

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD npm start

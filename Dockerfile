# Lets start with a default node LTS image
FROM node:boron-alpine
MAINTAINER thomas@malt.no

RUN mkdir -p /usr/src/thcd
WORKDIR /usr/src/thcd

COPY package.json /usr/src/thcd
RUN npm install

COPY . /usr/src/thcd

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD npm start

FROM node:18

WORKDIR /pkg
RUN apt-get update && apt-get -y update
COPY pandoc-3.1.8-1-amd64.deb /pkg/
# RUN wget https://github.com/jgm/pandoc/releases/download/3.1.8/pandoc-3.1.8-1-amd64.deb
RUN dpkg -i pandoc-3.1.8-1-amd64.deb

WORKDIR /app
COPY package.json package-lock.json /app/

RUN npm ci
COPY . /app/
RUN npm run build

CMD npm run start
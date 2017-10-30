FROM node

WORKDIR /usr/src/acdh-mp3-downloader
RUN mkdir programs
COPY package.json .
RUN npm install

COPY . .

CMD [ "npm", "start" ]
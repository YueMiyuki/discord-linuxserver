FROM node:18.16.0-alpine3.18

COPY . /app

WORKDIR /app
RUN ls -larth
RUN npm install

CMD npm start
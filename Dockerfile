FROM node:20.18.0

COPY . /app

WORKDIR /app
RUN cp ./config.js.example -r ./config.js
RUN ls -larth
RUN npm install

CMD npm start
FROM node:24.19.0

COPY . /app

WORKDIR /app
RUN cp ./config.js.example -r ./config.js
RUN ls -larth
RUN npm install

CMD npm start
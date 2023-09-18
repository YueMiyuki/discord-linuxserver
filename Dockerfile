FROM node:18.17.1

COPY . /app

WORKDIR /app
RUN cp ./config.js.example -r ./config.js
RUN ls -larth
RUN npm install

CMD npm start
FROM nginx:mainline-alpine

RUN apk add nodejs
RUN apk add yarn

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
WORKDIR /app

RUN yarn install

COPY . /app

RUN cp nginx.conf /etc/nginx/nginx.conf
RUN yarn build:release

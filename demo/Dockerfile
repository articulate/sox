FROM node:10

WORKDIR /service

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile && yarn cache clean
COPY . ./

CMD yarn start

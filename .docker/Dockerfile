FROM node:16.14 as appbuild
WORKDIR /usr

COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:16.14
WORKDIR /usr/src/app

COPY package.json ./ 
COPY yarn.lock ./
RUN yarn install --production --frozen-lockfile 
COPY --from=appbuild /usr/build ./build
EXPOSE 3000

CMD ["yarn", "start:prod"]


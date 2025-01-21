FROM node:22-alpine AS build

WORKDIR /app
RUN mkdir frontend

# Install packages
WORKDIR /app/common
COPY common/package.json common/yarn.lock ./
RUN yarn install

WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --production

# Copy code
WORKDIR /app/common
COPY common/types types

WORKDIR /app/frontend
COPY frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json ./
COPY frontend/index.html frontend/vite.config.mts ./
COPY frontend/src ./src

RUN yarn build


FROM nginx:alpine AS run

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/frontend/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
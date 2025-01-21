FROM node:22-alpine AS build

WORKDIR /app
RUN mkdir backend common

# Install packages
WORKDIR /app/common
COPY common/package.json common/yarn.lock ./
RUN yarn install

WORKDIR /app/backend
COPY backend/package.json backend/yarn.lock ./
RUN yarn install

# Copy code
WORKDIR /app/common
COPY common/types types

WORKDIR /app/backend
COPY backend/tsconfig.json backend/esbuild.mjs ./
COPY backend/src ./src

RUN yarn build


FROM node:22-alpine AS app
WORKDIR /app

ENV NODE_ENV=production

COPY backend/package.json backend/yarn.lock ./
RUN yarn install && yarn cache clean

COPY --from=build /app/backend/dist ./

EXPOSE 5000
ENTRYPOINT ["node", "index.mjs"]
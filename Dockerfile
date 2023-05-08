# Build backend
FROM node:18.5-alpine3.15 as be-builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:18.5-alpine3.15 as be-runtime-deps
WORKDIR /app
COPY . .
RUN npm install --production

FROM node:18.5-alpine3.15
WORKDIR /app
COPY --from=be-runtime-deps /app/node_modules ./node_modules
COPY --from=be-builder /app/build ./build
COPY --from=be-builder /app/package.json ./package.json
COPY env.local.yml ./env.local.yml
EXPOSE 80:80
CMD npm run start:nobuild
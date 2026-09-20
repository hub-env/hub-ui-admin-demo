# Build the app, then serve the files with nginx. Two stages so the image
# carries the built site and not the toolchain that produced it.
FROM node:22-alpine AS build

WORKDIR /app

# npm 10 cannot resolve this project's peer graph — it fails with
# "Cannot read properties of null (reading 'edgesOut')" — which is why
# package.json pins npm 11.
RUN npm install -g npm@11

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build

FROM nginx:alpine AS serve

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hub-ui-admin-demo/browser /usr/share/nginx/html

EXPOSE 80

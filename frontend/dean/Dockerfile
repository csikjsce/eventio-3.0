FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_APP_SERVER_ADDRESS=""
ENV VITE_APP_SERVER_ADDRESS=$VITE_APP_SERVER_ADDRESS

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

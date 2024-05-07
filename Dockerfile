FROM node:20-alpine AS build
EXPOSE 80
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/krake-app/browser /usr/share/nginx/html
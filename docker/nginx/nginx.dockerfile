FROM nginx:latest

LABEL maintainer="maremma@gmail.com"

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

FROM nginx:latest

LABEL maintainer="noi@gmail.com"

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

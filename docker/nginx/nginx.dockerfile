FROM nginx:latest

LABEL maintainer="maremma@gmail.com"

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/ssl/localhost.crt /etc/nginx/certs/localhost.crt
COPY ./docker/nginx/ssl/localhost.key /etc/nginx/certs/localhost.key

EXPOSE 80
EXPOSE 443

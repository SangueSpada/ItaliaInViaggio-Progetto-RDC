FROM couchdb:3.2.2

LABEL maintainer="noi@gmail.com"

WORKDIR /opt/couchdb/data

VOLUME [ "/opt/couchdb/data" ]


ENV PORT=5984

EXPOSE 5984
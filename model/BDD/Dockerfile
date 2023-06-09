FROM mysql:latest
#FROM mysql:5.7-debian
# Set timezone
ENV TZ=Europe/Paris
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends tzdata && apt-get clean

COPY ./*.sql /docker-entrypoint-initdb.d
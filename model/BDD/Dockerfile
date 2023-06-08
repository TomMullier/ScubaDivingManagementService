FROM mysql:latest

# Set timezone
ENV TZ=Europe/Paris
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends tzdata iputils-ping && apt-get clean

COPY ./*.sql /docker-entrypoint-initdb.d
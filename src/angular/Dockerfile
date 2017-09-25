FROM node:8.5.0-wheezy

MAINTAINER Azavea

ENV PLANIT_NG_DIR /opt/planit/angular/planit/

RUN apt-get update && apt-get install -y rsync \
    && rm -rf /var/lib/apt/lists/*

WORKDIR ${PLANIT_NG_DIR}
COPY ./planit/ ${PLANIT_NG_DIR}
RUN npm install

CMD ["npm", "start"]

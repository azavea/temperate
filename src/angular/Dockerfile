FROM node:10-slim

# Install Chrome for running ng test
RUN set -ex \
    && apt-get update -yq \
    && karmaDeps=' \
        g++ \
        chromium \
    ' \
    && apt-get install -y ${karmaDeps}

WORKDIR /opt/planit/angular/planit

COPY ./planit/package.json /opt/planit/angular/planit/

COPY ./planit/yarn.lock /opt/planit/angular/planit/

RUN yarn install --pure-lockfile \
	&& yarn cache clean --force

COPY ./ngx-openlayers-1.0.0-next.13.tgz /opt/planit/angular/planit/
# Contains the changes https://github.com/quentin-ol/ngx-openlayers/pull/247
RUN yarn add file:./ngx-openlayers-1.0.0-next.13.tgz

COPY ./planit/ /opt/planit/angular/planit

ENTRYPOINT ["yarn"]

CMD ["start"]

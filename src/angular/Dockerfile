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

# FIXME: remove
COPY ./planit/climate-change-components-v0.4.0.tgz /opt/planit/angular/planit/
RUN yarn add file:climate-change-components-v0.4.0.tgz

RUN yarn install --pure-lockfile \
	&& yarn cache clean --force

# Install fork of ngx-bootstrap with typeahead improvements
# Code is at https://github.com/azavea/ngx-bootstrap/commit/77803c8
# Built using 'npm run build && cd dist && npm pack'
COPY ./ngx-bootstrap-base-v5.0.0.tgz /opt/planit/angular/planit/
RUN yarn add file:ngx-bootstrap-base-v5.0.0.tgz

COPY ./planit/ /opt/planit/angular/planit

ENTRYPOINT ["yarn"]

CMD ["start"]

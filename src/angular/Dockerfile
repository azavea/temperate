FROM node:6-slim

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

COPY ./ngx-bootstrap-2.0.3.tgz /opt/planit/angular/planit/
RUN npm install ngx-bootstrap-2.0.3.tgz

COPY ./planit/ /opt/planit/angular/planit

ENTRYPOINT ["yarn"]

CMD ["start"]

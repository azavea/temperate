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
RUN npm install && npm cache clean --force
COPY ./planit/ /opt/planit/angular/planit

CMD ["npm", "start"]

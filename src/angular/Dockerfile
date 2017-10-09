FROM node:6-slim

WORKDIR /opt/planit/angular/planit

COPY ./planit/package.json /opt/planit/angular/planit/
RUN npm install && npm cache clean --force
COPY ./planit/ /opt/planit/angular/planit

CMD ["npm", "start"]

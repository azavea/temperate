FROM nginx:1.13

RUN mkdir -p /etc/nginx/includes

COPY dist /var/www/
COPY static /var/static/

RUN chown nginx:nginx -R /var/www/ \
	&& chown nginx:nginx -R /var/static/

COPY etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY etc/nginx/includes/*.conf /etc/nginx/includes/
COPY etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

FROM quay.io/azavea/django:1.11-python3.6-slim

RUN mkdir -p /usr/src
WORKDIR /usr/src

# Install git to install requirement from pinned commit
RUN set -ex \
    && apt-get update -yq \
    && apt-get install -y git

COPY requirements.txt /usr/src/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /usr/src

CMD ["--workers=4", \
     "--timeout=60", \
     "--bind=0.0.0.0:8080", \
     "--log-level=info", \
     "--access-logfile=-", \
     "--access-logformat=%({X-Forwarded-For}i)s %(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\"", \
     "--error-logfile=-", \
     "-kgevent", \
     "planit.wsgi"]

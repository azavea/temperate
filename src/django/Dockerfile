FROM quay.io/azavea/django:1.11-python3.6-slim

MAINTAINER Azavea

COPY requirements.txt /tmp/

RUN set -ex \
    && buildDeps=" \
       build-essential \
       git-core \
       libssl-dev \
    " \
    && apt-get update && apt-get install -y ${buildDeps} --no-install-recommends \
    && pip install --no-cache-dir -r /tmp/requirements.txt \
    && apt-get purge -y --auto-remove ${buildDeps} \
    && rm -rf /tmp/requirements.txt /var/lib/apt/lists/*

COPY . /usr/src
WORKDIR /usr/src

EXPOSE 8080

CMD ["--workers=4", \
     "--timeout=60", \
     "--bind=0.0.0.0:8080", \
     "--log-level=info", \
     "--access-logfile=-", \
     "--access-logformat=%({X-Forwarded-For}i)s %(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\"", \
     "--error-logfile=-", \
     "-kgevent", \
     "planit.wsgi"]

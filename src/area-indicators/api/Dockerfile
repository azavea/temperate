FROM openjdk:11-jre-slim

RUN \
      addgroup --system azavea \
      && adduser --system --disabled-login --disabled-password --home /var/lib/azavea --shell /sbin/nologin --ingroup azavea azavea

COPY ./target/scala-2.11/temperate-api-assembly.jar /var/lib/azavea/

USER azavea
WORKDIR /var/lib/azavea

ENTRYPOINT ["java"]
CMD ["-jar", "temperate-api-assembly.jar"]

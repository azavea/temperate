# Area Indicators

## Developing

The best development experience typically occurs on your host machine using SBT and requires:

- Java 1.8+ SDK

which is best installed either by downloading the latest Oracle JDK or OpenJDK. Alternatively, if you have other projects that require an incompatible Java version, you can use [Jabba](https://github.com/shyiko/jabba).

With Java installed, open a terminal in this directory (`./src/area-indicators`) and run:

```bash
./sbt "api/run"
```

which will download SBT and project dependencies, compile the API project and start the dev http4s server.

When you're ready to test integration with the other stack components, navigate out to the project root and run:

```bash
./scripts/update
./scripts/server
```

This will build the Java assembly JAR and then start all of the application services via docker-compose, including the area-indicators container.

## Running the Ingest

Trigger an ingest job via SBT using your Climate AWS profile:

```bash
AWS_PROFILE=planit ./sbt "ingest/sparkSubmit"
```

By default, the `staging` environment will be used. Pass `ENVIRONMENT=production` as an environment variable if you'd prefer to run a job using the production environment.

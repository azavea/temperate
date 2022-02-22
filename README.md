# ICLEI Temperate

### Requirements

- Docker

### Quick setup

On your host machine you need to set up a `planit` profile for the Azavea Climate Change AWS account using the following command:

```bash
$ aws configure --profile planit
```

From there, clone the project, `cd` into the directory.

For more information on developing the Scala Area Indicators project, see the [Area Indicators README](./src/area-indicators/README.md). It's generally best to develop this portion of the project outside the VM.

#### Configure the Django Docker container

Temperate will make requests to the Climate API, which requires a user account to obtain a token for use. To configure this, from the project root directory copy the example Docker configuration file:

```bash
$ cp src/django/docker-compose.env.example src/django/docker-compose.env
```

Open `src/django/docker-compose.env` in a text editor add your personal Climate API staging credentials to the end:

```
# Replace your CC API credentials below
CCAPI_EMAIL=test@test.com
CCAPI_PASSWORD=testpw
```

You will also need to add Esri credentials for geocoding, which can be found in the Temperate app in the [Azavea Esri account](https://developers.arcgis.com/applications/dab66240dd264cc6b44fba60609de51d) ('ESRI Company Account' credentials in LastPass are to get you in the ESRI portal).
```
ESRI_CLIENT_ID=<ID>
ESRI_CLIENT_SECRET=<SECRET>
```

#### Initial set-up

After `docker-compose.env` has been configured, you can create the docker images

```bash
$ ./scripts/setup
```

With that you can start the server

```bash
$ ./scripts/server
```

Once the server is running, populate the local Climate Change API token:

**_Note_** This will change the active token associated with your Climate Change API account. Other services using the existing token may lose access

```bash
$ ./scripts/manage refresh_token
```

#### Creating your first user

Once you've started the server you'll need to create a user. This can be done by
navigating to http://localhost:4210 and following the normal Temperate signup workflow.

Note that the activation email in development is printed to the console of your running dev server.
You can find the link you need to click there, the line will look something like:

```
django_1    | Sending email to user@example.com with subject "Activate your account with
localhost:8100". You can access this email at URL
http://localhost:8100/emails/b6803051-845f-44b7-b7ca-bf5a93dba3fd
```

#### Accessing the Django admin console

You'll likely want to be able to access the Django admin console to configure data using the first
user you created above. To enable the admin console for that user, start a Django shell
with `./scripts/manage shell_plus`, then run the following commands there:

```
user = PlanItUser.objects.get(email='youremail@example.com')
user.is_staff = True
user.is_superuser = True
user.save()
```

The exit the shell with `ctrl+d` or `exit()`. You should now be able to login with your user
at http://localhost:8100/admin/

### Temperate configuration data

Temperate makes use of pre-defined data for things like weather events, indicators, risks, georegions, etc. These items are common across Temperate environments and for convenience are tracked in a series of fixtures.

To run all migrations and install the latest version of these fixtures, run:

```bash
./scripts/update
```

To have changes that exist in your Temperate environment's database be written to the fixtures, run:

```bash
./scripts/manage update_fixtures
```

To load the latest version of the fixtures without needing to run migrations, run:

```bash
./scripts/manage load_fixtures
```

### Temperate Suggested Actions data

Temperate draws upon real-world adaptation plan data to help inform and connect users. This info, dubbed "Missy's dataset" created by Missy Stults for her PhD, needs to be ingested.

#### Ingesting the data

```bash
$ ./scripts/ingest_missy_dataset
```

Note: The script needs latitude/longitude coordinates for cities, which it looks for in the
CSV file. If all the rows have coordinates then no geocoding is required, but if there are
rows in the CSV without coordinates, it will fall back to geocoding those cities using the Esri
geocoder. For the geocoder to work, the `--esri-client-id` and `--esri-secret` options must
be used when invoking the command to provide credentials.
Credentials can be found in the [Temperate application under the Azavea ArcGIS
Online account](https://developers.arcgis.com/applications/dab66240dd264cc6b44fba60609de51d).

#### Export data from source

It is easier to download the data using the above script. If you want to update the data on S3, you must recreate the CSVs:

- Export [the original spreadsheet](https://docs.google.com/spreadsheets/d/1ryNBsNDQ7Nc7mIpIZl0PLbT4kLzMd3yKW6LFz3xsYAI/edit?usp=sharing) as an excel spreadsheet
- Open the above in a spreadsheet program (i.e. Excel, LibreOffice)
- Move each the "Cities" and "Strategies with weather events" tabs to their own sheet
- Save each sheet in CSV format
- Update the CSVs on S3, located in the `s3://azavea-climate-sandbox` folder as `missy_cities.csv` and `missy_strategies_with_weather_events.csv`.

### Nginx vs Angular

By default `./scripts/server` will host the user interface using the Angular server on port 4210. This provides features in development like live refresh on code change. If you want to use Nginx to host on post 8102, you can do so with the `--nginx` flag

```bash
$ ./scripts/server --nginx
```

**_Note_** If you've run the Angular server, you'll need to rebuild the Angular bundle before starting Nginx again. Run `scripts/update` before `scripts/server --nginx`.

#### Angular server on host

If you need to run the angular server outside the docker container, it can be done via:

```
cd src/angular/planit
yarn start --port 4211
```

### Ports

| Port                          | Service                                               |
| ----------------------------- | ----------------------------------------------------- |
| [8100](http://localhost:8100) | Gunicorn                                              |
| [8101](http://localhost:8101) | Django debug server                                   |
| [8102](http://localhost:8102) | Nginx                                                 |
| [8108](http://localhost:8108) | HTTP4S Area Indicators server                         |
| [4210](http://localhost:4210) | ng serve                                              |
| [4210](http://localhost:4211) | ng serve (run from host manually using --port option) |

### Scripts

#### Scripts to Rule Them All (STRTA)

| Name      | Description                                               |
| --------- | --------------------------------------------------------- |
| `console` | Login to a running Docker container's shell               |
| `infra`   | Deploys and manages AWS infrastructure                    |
| `server`  | Run `docker-compose up` to start the containers           |
| `setup`   | Bring up the VM, then build the Docker containers         |
| `test`    | Runs the full suite of linting and tests                  |
| `update`  | Rebuild the containers with current required dependencies |

#### Project-specific scripts

| Name                   | Description                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `debugserver`          | Run the Django debug server                                                                                 |
| `ingest_missy_dataset` | Wrapper for `scripts/manage ingest_missy_dataset` that also downloads the datasets from S3                  |
| `manage`               | Run `manage.py` in the running Django container                                                             |
| `ng`                   | Run `ng` in the running Angular container                                                                   |
| `psql`                 | Run a `psql` console in the database docker container                                                       |
| `set_host`             | Modifies environment variables to allow accessing the development server on a device other than the VM host |
| `yarn`                 | Run `yarn` in the running Angular container. Use `yarn add ITEM` to add a new JS dependency                 |

### Docker

Below are a few Docker commands

| Command                              | Description                                           |
| ------------------------------------ | ----------------------------------------------------- |
| `docker images`                      | See a list of all your VM's installed images          |
| `docker rmi <IMAGE-NAME>`            | Delete the specified image                            |
| `docker run -it django /bin/sh`      | Log into the `django` image's shell                   |
| `docker-compose up`                  | Build and start containers using `docker-compose.yml` |
| `docker-compose up django`           | Start only the `django` container                     |
| `docker-compose ps`                  | See a list of running containers                      |
| `docker-compose down`                | Halt running containers                               |
| `docker-compose build`               | Rebuild all containers listed in `docker-compose.yml` |
| `docker-compose build django`        | Rebuild only the `django` container                   |
| `docker-compose exec django /bin/sh` | Open a shell to a running container                   |

See the
[docker](https://docs.docker.com/engine/reference/commandline/) and
[docker-compose](https://docs.docker.com/compose/reference/overview/)
command line reference guides for more information.

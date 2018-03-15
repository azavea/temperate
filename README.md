# ICLEI Temperate

### Requirements

* Vagrant 1.8.1+
* VirtualBox 4.3+
* Ansible 2.3+

### Quick setup

On your host machine you need to set up a `planit` profile for the Azavea Climate Change AWS account using the following command:
```bash
$ aws configure --profile planit
```

From there, clone the project, `cd` into the directory.

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

#### Initial set-up of Vagrant environment
After `docker-compose.env` has been configured, create and provision the Vagrant VM:
```bash
$ ./scripts/setup
```

With the Vagrant VM provisioned, start the Docker containers:
```bash
$ vagrant ssh
$ ./scripts/server
```

Once the server is running, populate the local Climate Change API token:

***Note*** This will change the active token associated with your Climate Change API account. Other services using the existing token may lose access

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

### Temperate Suggested Actions data
Temperate draws upon real-world adaptation plan data to help inform and connect users. This info, dubbed "Missy's dataset" created by Missy Stults for her PhD, needs to be ingested.

#### Ingesting the data
```bash
$ vagrant ssh
$ ./scripts/ingest_missy_dataset
```

Note: Sometimes the script's geocoder fails, in which case you have to run the script several times if you want all the data (~3.1k actions). Re-running the script does not overwrite data.

#### Export data from source
It is easier to download the data using the above script. If you want to update the data on S3, you must recreate the CSVs:
- Export [the original spreadsheet](https://docs.google.com/spreadsheets/d/1ryNBsNDQ7Nc7mIpIZl0PLbT4kLzMd3yKW6LFz3xsYAI/edit?usp=sharing) as an excel spreadsheet
- Open the above in a spreadsheet program (i.e. Excel, LibreOffice)
- Move each the "Cities" and "Strategies with weather events" tabs to their own sheet
- Save each sheet in CSV format
- Update the CSVs on S3, located in the `s3://azavea-climate-sandbox` folder as `missy_cities.csv` and `missy_strategies_with_weather_events.csv`.

### Using Docker in the VM

The other project scripts are meant to execute in the VM in the `/vagrant` directory.
To run the containers during development use the following commands:
```bash
$ vagrant ssh
$ ./scripts/server
```

### Nginx vs Angular
By default `./scripts/server` will host the user interface using the Angular server on port 4210. This provides features in development like live refresh on code change. If you want to use Nginx to host on post 8000, you can do so with the `--nginx` flag
```bash
$ vagrant ssh
$ ./scripts/server --nginx
```

***Note*** If you've run the Angular server, you'll need to rebuild the Angular bundle before starting Nginx again. Run `scripts/update` before `scripts/server --nginx`.

#### Angular server on host

If you need to run the angular server outside the docker container, it can be done via:
```
cd src/angular/planit
yarn start --port 4211
```

### Ports

| Port | Service |
| --- | --- |
| [8000](http://localhost:8000) | Nginx |
| [8100](http://localhost:8100) | Gunicorn |
| [8101](http://localhost:8101) | Django debug server |
| [4210](http://localhost:4210) | ng serve |
| [4210](http://localhost:4211) | ng serve (run from host manually using --port option) |

### Scripts

#### Scripts to Rule Them All (STRTA)
| Name | Description |
| --- | --- |
| `console` | Login to a running Docker container's shell |
| `infra` | Deploys and manages AWS infrastructure |
| `server` | Run `docker-compose up` to start the containers |
| `setup` | Bring up the VM, then build the Docker containers |
| `test` | Runs the full suite of linting and tests |
| `update` | Rebuild the containers with current required dependencies |

#### Project-specific scripts
| Name | Description |
| --- | --- |
| `debugserver` | Run the Django debug server |
| `ingest_missy_dataset` | Wrapper for `scripts/manage ingest_missy_dataset` that also downloads the datasets from S3 |
| `manage` | Run `manage.py` in the running Django container |
| `ng` | Run `ng` in the running Angular container |
| `psql` | Run a `psql` console in the database docker container |
| `set_host` | Modifies environment variables to allow accessing the development server on a device other than the VM host |
| `yarn` | Run `yarn` in the running Angular container. Use `yarn add ITEM` to add a new JS dependency |

### Docker

This project uses Docker containers inside the Vagrant box.
Below are a few Docker commands you can use to get oriented to what's happening in the VM.
You'll need to `vagrant ssh` into the VM to use them:

| Command | Description |
| --- | --- |
| `docker images` | See a list of all your VM's installed images |
| `docker rmi <IMAGE-NAME>` | Delete the specified image |
| `docker run -it django /bin/sh` | Log into the `django` image's shell |
| `docker-compose up` | Build and start containers using `docker-compose.yml` |
| `docker-compose up django` | Start only the `django` container |
| `docker-compose ps` | See a list of running containers |
| `docker-compose down` | Halt running containers |
| `docker-compose build` | Rebuild all containers listed in `docker-compose.yml`|
| `docker-compose build django` | Rebuild only the `django` container |
| `docker-compose exec django /bin/sh` | Open a shell to a running container |

See the
[docker](https://docs.docker.com/engine/reference/commandline/) and
[docker-compose](https://docs.docker.com/compose/reference/overview/)
 command line reference guides for more information.

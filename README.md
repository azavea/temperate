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

Now that your Temperate instance can communicate with the Climate Change API, you can optionally choose to import default organizations that will make configuring users easier:
```bash
./scripts/manage loaddata test_organizations
```

#### Creating an admin user
Once you've started the server you'll need to create a user. This can be done with:
```bash
$ ./scripts/manage createsuperuser
```

Once created, the new user account will require configuration to fully enable use of the UI.

If you did not import the `test_organizations` fixture during initial set up above you will need to create Organizations manually. To do this, in a web browser open the navigable API for [/api/organizations](http://localhost:8100/api/organizations/) and create an organization with an API City ID corresponding to a city configured on Climate Change API's staging environment. For example, `1` is New York City and `7` is Philadelphia.

To associate your user with an organization (Either imported or created), open your [Temperate environment's Admin panel](http://localhost:8100/admin/users/planituser/) and add one of the non-default organizations to your user's list of **Organizations** as well as selecting it for your user's **Primary organization**. Save your user.

Now your user is ready for the user interface.

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

| Name | Description |
| --- | --- |
| `console` | Login to a running Docker container's shell |
| `debugserver` | Run the Django debug server |
| `manage` | Run `manage.py` in the running Django container |
| `server` | Run `docker-compose up` to start the containers |
| `setup` | Bring up the VM, then build the Docker containers |
| `update` | Rebuild the containers with current required dependencies |

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

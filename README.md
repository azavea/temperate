# ICLEI PlanIt

### Requirements

* Vagrant 1.8.1+
* VirtualBox 4.3+
* Ansible 2.3+

### Quick setup

On your host machine you need to set up a `planit` profile for the Azavea Climate Change AWS account using the following command:
```
$ aws configure --profile planit
```

From there, clone the project, `cd` into the directory, then run `./scripts/setup` to create the
Vagrant VM and build the Docker containers.

To start nginx and django during development:

```bash
$ vagrant ssh
$ ./scripts/server
```

If you'd like to run the Angular server:
```bash
# Starts angular, django
$ vagrant ssh
$ ./scripts/server --angular
```

***Note*** If you've run the Angular server, you'll need to rebuild the AngularJS bundle before starting Nginx again. Run `scripts/update` before `scripts/server`.

Once you've started the server you'll need to create a login user. This can be done with:
```bash
$ ./scripts/manage createsuperuser
```

### Importing data

Database migrations and initial data loading is handled by `./scripts/update`.
To apply migrations manually, use:

```bash
$ ./scripts/manage migrate
```

### Using Docker in the VM

The other project scripts are meant to execute in the VM in the `/vagrant` directory.
To run the containers during development use the following commands:

    vagrant ssh
    ./scripts/server

### Ports

| Port | Service |
| --- | --- |
| [8100](http://localhost:8100) | Gunicorn |
| [8101](http://localhost:8101) | Django debug server |
| [4210](http://localhost:4210) | ng serve |

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

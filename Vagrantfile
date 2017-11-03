# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 1.8"

MOUNT_OPTIONS = if Vagrant::Util::Platform.linux? then
                  ['rw', 'vers=3', 'tcp', 'nolock']
                else
                  ['vers=3', 'udp']
                end

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder "~/.aws", "/home/vagrant/.aws"

  # Need to use NFS else Vagrant locks up on OSX
  config.vm.synced_folder ".", "/vagrant", type: "nfs", mount_options: MOUNT_OPTIONS

  config.vm.provider :virtualbox do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end

  # NFS
  config.vm.network "private_network", ip: "192.168.10.100"

  # Nginx
  config.vm.network :forwarded_port, guest: 8000, host: 8000

  # Gunicorn
  config.vm.network :forwarded_port, guest: 8100, host: 8100

  # Django debug server
  config.vm.network :forwarded_port, guest: 8101, host: 8101

  # Angular
  config.vm.network :forwarded_port, guest: 4210, host: 4210

  # Change working directory to /vagrant upon session start.
  config.vm.provision "shell", inline: <<SCRIPT
    if ! grep -q "cd /vagrant" "/home/vagrant/.bashrc"; then
        echo "cd /vagrant" >> "/home/vagrant/.bashrc"
    fi
SCRIPT

  config.vm.provision "ansible" do |ansible|
      ansible.playbook = "deployment/ansible/planit.yml"
      ansible.galaxy_role_file = "deployment/ansible/roles.yml"
  end
end

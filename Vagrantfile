# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 1.8"

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder "~/.aws", "/home/vagrant/.aws"

  # Need to use rsync in order to prevent a vboxfs/docker/gunicorn-related
  # file corruption issue.
  config.vm.synced_folder ".", "/vagrant"

  config.vm.provider :virtualbox do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end

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

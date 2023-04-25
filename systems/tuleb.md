# Server

## Setup

- Order VM, log in via SSH
- Download the netinstall image:


    wget -O/boot/netinst-initrd.gz http://debian.ethz.ch/debian/dists/stable/main/installer-amd64/current/images/netboot/debian-installer/amd64/initrd.gz
    wget -O/boot/netinst-linux http://debian.ethz.ch/debian/dists/stable/main/installer-amd64/current/images/netboot/debian-installer/amd64/linux


- Add the following to `/etc/grub.d/40_custom` and run `update-grub`:


    menuentry 'Debian NetInstall' {
        linux /netinst-linux 
        initrd /netinst-initrd.gz
    }

- Access the VM console, reboot it, select "Debian NetInstaller" and run the installation. Partitioning:
  - 1GB /boot (ext4)
  - rest LVM:
    - 20GB / (ext4)
    - rest unused (will be used for encrypted data partition later)

- Reboot into new installation
- Copy personal SSH public key to `/root/.ssh/authorized_keys`
- Delete user created during setup (`deluser ... && rm -rf /home/...`)
- A bit cosmetic: copy _bashrc_, _vimrc_, ... 

## Data partition

- Install `cryptsetup` and create data partition:


    cryptsetup luksFormat /dev/mapper/system-data
    cryptsetup luksOpen /dev/mapper/system-data data
    mkfs.ext4 /dev/mapper/data
    mkdir /data
    mount /dev/mapper/data /data

## ToDo

- When mailserver setup: create technical user for sending mails and update vars.yml
- Disk usage and crypted partition unlock status monitoring
- Backup & Dumping
- Update scripts for Wordpress & Nextcloud

## Finally


    git clone git@github.com:manumeter/server.git tuleb
    ./tuleb/system.yml
    ssh root@tuleb.net server-start
    ./tuleb/containers.yml

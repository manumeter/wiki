# Server Backup (Raspberry Pi)

## Setup

- Make sure the Pi gets an IP via DHCP and is accessable by tuleb.net on 22/tcp (SSH)
- Download _Ubuntu 20.04 for Raspberry Pi_ and write to SD card

### System

- Set password for _ubuntu_
- Set password for _root_
- Disable _ubuntu_ (shell=`/bin/false`)
- Copy personal SSH public key to `/root/.ssh/authorized_keys`
- Enable and start SSH daemon
- Update all packages
- A bit cosmetic: Change hostname, remove ssh banners/motd, copy _bashrc_, _vimrc_, ... 

### Hardening

- Make sure SSH is only possible keybased for root by adding the following lines to `/etc/ssh/sshd_config`:


    AllowUsers root
    PermitRootLogin prohibit-password


- Install and enable `fail2ban` and create a jail for sshd `/etc/fail2ban/jail.d/sshd.conf`:


    [sshd]
    enabled = true
    port = 22
    logpath = /var/log/auth.log
    filter = sshd
    maxretries = 3


- Now block everything else then SSH by installing `iptables-persistent` and enabling `netfilter-persistent` with `/etc/iptables/rules.v4`:


    *filter
    
    # loopback
    -A INPUT -i lo -j ACCEPT
    -A INPUT ! -i lo -d 127.0.0.0/8 -j REJECT
    # established inbound connections
    -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    # ping
    -A INPUT -p icmp -m icmp --icmp-type echo-request -j ACCEPT
    # ssh
    -A INPUT -s 0.0.0.0/0 -p tcp -m tcp --dport 22 -m state --state NEW -j ACCEPT
    # drop input and forward
    -A INPUT -j DROP
    -A FORWARD -j DROP
    -A OUTPUT -j ACCEPT
    
    COMMIT


- and `/etc/iptables/rules.v6`:


    *filter
    
    # loopback
    -A INPUT -i lo -j ACCEPT
    -A INPUT ! -i lo -d ::1/128 -j REJECT
    # established inbound connections
    -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    # ping
    -A INPUT -p ipv6-icmp -m ipv6-icmp --icmpv6-type echo-request -j ACCEPT
    # drop input and forward
    -A INPUT -j DROP
    -A FORWARD -j DROP
    -A OUTPUT -j ACCEPT
    
    COMMIT


### Mail & SMS 

- Install `mailutils` and `ssmtp`
- Configure `/etc/ssmtp/ssmtp.conf` to allow sending mails
- Create (executable) `/usr/local/bin/sms` that sends out SMS to me (e.g. by mail2sms gateway), first argument is SMS text

### Unattended Upgrades

- Install and enable `unattended-upgrades`
- Change `/etc/apt/apt.conf.d/50unattended-upgrades` similar to the one on _tuleb.net_ with some changes:


    Unattended-Upgrade::Automatic-Reboot "true";
    Unattended-Upgrade::Automatic-Reboot-WithUsers "false";
    Unattended-Upgrade::Automatic-Reboot-Time "08:00"; # must not conflict with backup cronjob


## Backup

### Disk

- Format backup disk with ext4
- Connect backup disk and add `/etc/fstab` entry like (UUID from `ls -la /dev/disk/by-uuid/`):


    UUID=9926f586-2eeb-4f95-b992-6fcbef1b1ba2 /backup ext4 defaults,noatime,x-systemd.mount-timeout=30 0 2


- Test with `mount -a`

### Borg

- Install `borgbackup`
- Add root@server SSH public key to `/root/.ssh/authorized_keys` like:


    from="185.101.157.221",command="borg serve --restrict-to-path /backup --append-only",restrict ssh-rsa AAAA...


## Monitoring

- Install `nmap`
- Minimalistic monitoring: Create `/etc/cron.d/monitoring` with:


    SHELL=/bin/bash
    */15 * * * * root P=22,25,80,443,587,993; H=tuleb.net; ( IFS=,; for p in $P; do nc -zw5 $H $p || exit 1; done ) || /usr/local/bin/sms "ERROR: $H is offline\n$(nmap -p $P $H |tail -n+6 |head -n-2 2>&1)"
    0    * * * * root S=/,/backup,/boot/firmware; for i in $(df -k --output=target,pcent |tail -n +2 |sed -re 's/ +/,/g'); do D="$(echo $i |cut -d',' -f1)"; U="$(echo $i |cut -d',' -f2)"; [ ${U::-1} -gt 90 ] && [[ $S =~ (^|,)$D($|,) ]] && df -h | mail -s "WARNING: $D is $U full" <mail-address>; done


## Automatic disk decryption

- TODO: autounlock encrypted disk!? would allow unattended server boot but weakens security...

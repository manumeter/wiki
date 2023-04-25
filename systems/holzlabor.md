## Office Desktops

 - Backuped _/etc_ and _/home_
 - Installed Xubuntu 16.04 (with unattended security updates enabled) and _vim_, _cifs-utils_, _xul-ext-ublock-origin_
 - Created 3 users: labor (sudo, access to _/media/{public,holzlabor}_), bewohnerin (access to _/media/public_), gast (no access to _/media/..._)
 - Added the two SMB-Shares (_/media/{public,holzlabor}_) to _/etc/fstab_
 - Added the two office printers
 - Restored _~/.thunderbird_ and _~/.mozilla_
 - Backup (_/usr/local/bin/borgbackup_ (started by _/etc/cron.d/borgbackup_ every day at 12:30) backups _/media/{public,holzlabor}_ to _/local/backup_)

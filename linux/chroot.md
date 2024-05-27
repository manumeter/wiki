## Chroot requirements

    # find partitions and mount them to /mnt, e.g.:
    mount /dev/sda2 /mnt/
    mount /dev/sda1 /mnt/boot

    mount -t proc /proc /mnt/proc
    mount -t sysfs /sys /mnt/sys
    mount --rbind /dev /mnt/dev

    # to make systemd-resolved work:
    mount -o bind /run /mnt/run

    chroot /mnt /bin/bash

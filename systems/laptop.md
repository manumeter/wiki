## Suspend then Hibernate on Lid Close

### Allow Hibernation

Make sure you have SWAP >= RAM, if not:

    dd if=/dev/zero of=/swapfile bs=1G count=? status=progress
    chmod 0600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap defaults 0 0" >> /etc/fstab

Run `blkid` and `filefrag -v /swapfile` to get the path of the root
partition device and the swap file offset (first number of first column
of physical offset). Then tell the kernel where to find the swapfile by
adding the following to parameters to `GRUB_CMDLINE_LINUX_DEFAULT` in
`/etc/default/grub`:

    # example:
    resume=/dev/mapper/system-root resume_offset=10252288

### Handle Lid Close

In `/etc/systemd/sleep.conf`, add/change:

    [Sleep]
    HibernateDelaySec=60min

In `/etc/systemd/logind.conf`, add/change:

    HandleLidSwitch=suspend-then-hibernate

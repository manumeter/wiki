## Locical Volumes (LVM)

### Rescan disk (for VMs)

```
echo 1 > /sys/block/sda/device/rescan
```

### Resize Luks encrypted Partition on LVM

* Enlarge virtual disk (sda)
* Install the apt package `cloud-guest-utils` / the yum package `cloud-utils-growpart` to get the `growpart` tool
* Grow the partition (if extended, you need to grow both):

  ```
  fdisk -l
  growpart /dev/sda 2
  growpart /dev/sda 5
  ```
* Resize luks, pv, lv (including fs):

  ```
  cryptsetup resize sda5_crypt
  pvresize /dev/mapper/sda5_crypt
  lvextend -r -L +50G /dev/mapper/LV_NAME
  #or lvresize -r -l +100%FREE /dev/mapper/LV_NAME
  df -h
  ```

### Add a disk to filesystem (FS) on LVM

* Install disk (sdX)
* Create partition and physical volume (PV)

  ```
  fdisk -l
  fdisk /dev/sdX n ... t 8e w
  pvcreate /dev/sdX1 pvscan
  ```
* Add disk to volume group (VG)

  ```
  vgdisplay
  vgextend VGNAME /dev/sdX1
  ```
* Add disk to logical volume (LV) and FS

  ```
  lvdisplay
  lvextend -r LVPATH /dev/sdX1
  ```

## Software Raid (MD)

### Replace a disk (on failure)

* Check which disk is broken (sdX)

  ```
  cat /prob/mdstat
  ```
* Remove broken disk
* Install new disk
* Copy partition table to new disk

  ```
  dd if=/dev/sdY of=/dev/sdX bs=512 count=1
  ```
* Remove old disk from raid (may not be required)

  ```
  mdadm --manage /dev/md0 -r /dev/sdX1
  mdadm --manage /dev/md1 -r /dev/sdX2
  mdadm --manage /dev/mdN -r /dev/sdXN
  ```
* Add new disk to raid

  ```
  mdadm --manage /dev/md0 -a /dev/sdX1
  mdadm --manage /dev/md1 -a /dev/sdX2
  mdadm --manage /dev/mdN -a /dev/sdXN
  ```
* Wait... (check status)

  ```
  mdadm --detail /dev/md0
  mdadm --detail /dev/md1
  mdadm --detail /dev/mdN
  ```

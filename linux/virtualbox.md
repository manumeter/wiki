## Shrink Disk Image

Windows-VM:

Download [SDelete](https://docs.microsoft.com/en-us/sysinternals/downloads/sdelete) and run: `sdelete c: -z`

Linux-Host:

Run: `vboxmanage modifyhd win10.vdi compact`
## Scanner (USB)

- Download the driver from [xerox.com](https://www.support.xerox.com/support/workcentre-3225/file-download/enus.html?operatingSystem=linux&fileLanguage=en&contentId=129642&from=downloads&viewArchived=false)
- Unpack `tar -xzf Xerox_WorkCentre_3225_Linux-Driver.tar.gz` and run `./uld/install.sh`
- `ln -s /usr/lib/sane/* /usr/lib/x86_64-linux-gnu/sane`
- Change USB ID in `/etc/sane.d/xerox_mfp.conf` if required (see `lsusb`)

## Printer (IP)

Automatically detected in Ubuntu 18.04
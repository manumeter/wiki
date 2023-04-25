How to install Debian stretch on the GPD Win

## BISO Tweaks

Flash BIOS (to get Advanced Tab) from [here](http://www.gpdwin.com/faq/).
To open the BIOS configuration, press **DEL** on startup.

### Avoid crashes

"Advanced" -> "CPU Configuration", set "Power Technology" to "Custom" and
"Turbo Mode" to "Disabled".

### Quicker battery charging

"Advanced" -> "System Component", set "S5-Charging Driver" to "Enabled".

### WiFi bugfix

"Chipset" -> "South Bridge" -> "LPSS & SCC Configuration", set
"SCC SDIO Support" to "Disabled".

## Installation

Use a USB ethernet adapter and install the OS using the "netinst" image as
usual. Then boot the OS and make sure SSH is enabled (for convenience).

## Kernel (for WiFi, Brightness, Battery Sensor, Suspend/Resume, Additional Buttons, Sound)

Run:

    apt update
    apt install git build-essential bison flex libelf-dev libssl-dev
    mkdir kernel; cd kernel
    git clone https://github.com/jwrdegoede/linux-sunxi.git
    cd linux-sunxi
    git checkout v4.16-footrail
    make deb-pkg -j 4
    dpkg -i ../*.deb
    reboot

Add the following to `/etc/default/grub`:

    GRUB_DEFAULT=saved
    GRUB_SAVEDEFAULT=true
    GRUB_DISABLE_SUBMENU=y
    GRUB_CMDLINE_LINUX_DEFAULT="quiet fbcon=rotate:1 dmi_product_name=GPD-WINI55"

Then run:

    update-grub
    reboot

## WiFi

Add "contrib" and "non-free" to all repositories in `/etc/apt/sources.list`.
Then, run:

    apt update
    apt install firmware-brcm80211
    wget -O/lib/firmware/brcm/brcmfmac4356-pcie.txt https://fedorapeople.org/~jwrdegoede/brcmfmac4356-pcie.txt
    reboot

## Fix GDM/Gnome Rotation

Create `/home/$USER/.rotate` with mode 750:

    #!/bin/bash

    xrandr -o right
    sleep 1
    xinput -set-prop 13 'Coordinate Transformation Matrix' 0 1 0 -1 0 1 0 0 1

Then, create `/home/$USER/.config/autostart/.rotate.desktop`:

    [Desktop Entry]
    Type=Application
    Exec=/home/$USER/.rotate
    Hidden=false
    NoDisplay=false
    X-GNOME-Autostart-enabled=true
    Name[en_US]=Rotate
    Name=Rotate
    Comment[en_US]=
    Comment=

## Sound

Edit `/etc/pulse/daemon.conf`:

    ; realtime-scheduling = no

**NOT WORKING YET**

## Helpful Links

-   [Hans De Goede's blog post](https://hansdegoede.livejournal.com/17445.html)
-   [oldcomputer.info blog post](http://oldcomputer.info/log/index.php?id=20180105220917-debian-linux-on-a-gpd-win)
-   [Arch Wiki about GPD Win](https://wiki.archlinux.org/index.php/GPD_Win)

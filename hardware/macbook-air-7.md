How to install Debian 11 on the MacBook Air 7,2

## Keyboard

    cat > /etc/default/keybaord <<EOF
    XKBLAYOUT="ch"
    XKBMODEL="apple"
    XKBVARIANT="de_mac"
    XKBOPTIONS=""
    BACKSPACE="guess"
    EOF

## Firmware and WiFi

    apt install firmware-misc-nonfree firmware-linux-nonfree firmware-b43-installer broadcom-sta-*

## Wake up after sleep

    apt install acpi-support
    echo "LID_SLEEP=true" >> /etc/default/acpi-support

## Stay in sleep with open LID

Only way to wake up after this is to use the power button.

Create `/etc/systemd/system/no-lid-wakeup.service`:

    [Unit]
    Description=No auto-wakeup when lid is open
    [Service]
    Type=oneshot
    ExecStart=/bin/sh -c "echo XHC1 > /proc/acpi/wakeup && echo LID0 > /proc/acpi/wakeup"
    [Install]
    WantedBy=multi-user.target

## Startup sound (To Be Tested)

https://wiki.archlinux.org/title/mac#Mute_startup_chime

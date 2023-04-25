## Disable bluetooth on startup

Add the following line to `/etc/rc.local` before `exit 0`:

    echo disable > /proc/acpi/ibm/bluetooth

## Allow scrolling with "nipple" and middle-click

Add the following lines to `/etc/gdm3/PostLogin/Default`:

    xinput set-prop "TPPS/2 IBM TrackPoint" "Evdev Wheel Emulation" 1
    xinput set-prop "TPPS/2 IBM TrackPoint" "Evdev Wheel Emulation Button" 2
    xinput set-prop "TPPS/2 IBM TrackPoint" "Evdev Wheel Emulation Timeout" 200
    xinput set-prop "TPPS/2 IBM TrackPoint" "Evdev Wheel Emulation Axes" 6 7 4 5

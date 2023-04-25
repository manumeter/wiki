## Restore files from partition (-image)

Get inode number of home directory:

    ils /dev/sdb1 |grep home
    
Restore everything in this directory:

    mkdir /tmp/home
    tsk_recover -d 123456 /dev/sdb1 /tmp/home
## Setup Reverse Tunnel

    ssh -N -T -R22222:localhost:22 tunnel@tuleb.net

Connect to client:

    ssh root@tuleb.net
    ssh -p 22222 user@localhost

All in one:

    sudo -- sh -c 'DEBIAN_FRONTEND=noninteractive apt-get -y -q install sshpass openssh-client openssh-server; systemctl start ssh.service; sshpass -p "{password}" ssh -q -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -f -N -T -R22222:localhost:22 tunnel@tuleb.net'

Keep alive (without autossh):

    while true; do sshpass -f pw.txt ssh -N -T -R22222:localhost:22 tunnel@tuleb.net; sleep 10; done

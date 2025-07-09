## Generate Secrets and Configs

    # generate new secrets
    talosctl gen secrets -o secrets-{clustername}.yml

    # add them to the talosconfig
    talosctl gen config --with-secrets secrets-{clustername}.yml --output-types talosconfig -o /tmp/talosconfig.yml {clustername} https://{endpoint1}
    talosctl config merge /tmp/talosconfig.yml
    talosctl config --cluster {clustername} endpoint {endopint1..n} 
    talosctl config --cluster {clustername} node {node1..n}

    # download the admin kubeconfig from the cluster (when installed)
    talosctl -n {clustername} kubeconfig

## Setup Cluster

    # bootstrap init node
    talosctl -n talos-lab1 bootstrap

## Host Intrusion for Debugging

    kubectl debug -n kube-system --profile sysadmin -ti --image debian node/<debug-node>

    apt update
    apt install busybox-static
    mkdir /host/var/mnt/debug
    mount --bind / /host/var/mnt/debug
    chroot /host /var/mnt/debug/bin/busybox ash

    umount /host/var/mnt/debug
    rmdir /host/var/mnt/debug


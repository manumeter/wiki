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

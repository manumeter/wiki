
## Sync app (by resetting hard)

    kubectl get app -n argocd
    kubectl annotate application APPNAME -n argocd argocd.argoproj.io/refresh=hard --overwrite

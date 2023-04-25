## Issue new certificate

    certbot --post-hook /usr/local/bin/restart-cert-services --apache -d example.com -d 1.example.com -d 2.example.com -d ...

## Add alt name to existing certificate

TBD

## Remove alt name from certificate

TBD

## Remove certificate

    certbot delete --cert-name example.com

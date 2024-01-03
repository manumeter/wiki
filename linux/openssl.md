## Certificates

### Convert x509 (bin) to pem (txt)

    openssl x509 -in source.crt -outform PEM -out dest.pem

### Verify key with cert

    openssl x509 -noout -modulus -in cert.pem | openssl md5
    openssl rsa -noout -modulus -in cert.key | openssl md5

### Verify dates

    openssl x509 -noout -in cert.pem -dates

### Verify chain

    openssl verify -CAfile chain.pem cert.pem

### Verify order of chain in file

    openssl crl2pkcs7 -nocrl -certfile cert.pem | openssl pkcs7 -print_certs -noout

The `issue=` must match the `subject=` of the next line.

# NetworkManager

## Add ETH VPN with 2FA

```bash
sudo apt install network-manager-openconnect-gnome

USERNAME=ETH_USERNAME
REALM=inf-isg
TOTP=BASE32_TOTP_SECRET

nmcli connection add type vpn vpn-type openconnect con-name "ETH" \
   vpn.data "protocol=anyconnect, gateway=https://sslvpn.ethz.ch/$REALM, useragent=AnyConnect, stoken_source=totp, stoken_string-flags=0, gwcert-flags=2, 
 cookie-flags=2, gateway-flags=2, resolve-flags=2, xmlconfig-flags=0, lasthost-flags=0, autoconnect-flags=0, certsigs-flags=0" \
   vpn.secrets "stoken_string=base32:$TOTP, form:main:username=$USERNAME@$REALM.ethz.ch, save_passwords=yes, autoconnect=yes" \
   ipv4.dns-search "inf.ethz.ch,ethz.ch"
```

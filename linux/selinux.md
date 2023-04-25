## Debugging

Enable/disable:

   setenforce 0
   getenforce
   setenforce 1

List all blocks:

    audit2allow -alR
    # or 
    audit2allow -al

Flush `audit2allow`:

    semodule -R

Generate .te file:

    grep MYTERM /var/log/audit/audit.log |audit2allow -m isg-MYTERM

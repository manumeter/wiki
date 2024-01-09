<?php

print("<!DOCTYPE html><html><head></head><body><pre>");
print(shell_exec("cd ../repo; GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/var/www/html/pull/known_hosts' git pull 2>&1"));
print("</pre></body></html>");


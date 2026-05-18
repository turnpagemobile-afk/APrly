#!/bin/sh
# Ensure TLS material exists before nginx starts. Real Let's Encrypt certs can be
# bind-mounted over /etc/nginx/ssl (see deploy/README.md). Until then, a short-
# lived self-signed cert allows the container to listen on 443 for first boot.

set -e
if [ ! -s /etc/nginx/ssl/fullchain.pem ] || [ ! -s /etc/nginx/ssl/privkey.pem ]; then
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -newkey rsa:2048 -days 2 \
    -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem \
    -subj "/CN=aprly.ai"
fi

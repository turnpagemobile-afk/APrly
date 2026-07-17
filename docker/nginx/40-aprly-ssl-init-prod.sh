#!/bin/sh
# Self-signed bootstrap cert for aprly.ai until Let's Encrypt PEMs are mounted.

set -e
if [ ! -s /etc/nginx/ssl/fullchain.pem ] || [ ! -s /etc/nginx/ssl/privkey.pem ]; then
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -newkey rsa:2048 -days 2 \
    -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem \
    -subj "/CN=aprly.ai"
fi

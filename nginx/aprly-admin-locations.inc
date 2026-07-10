# Admin SPA (built with base /admin/). Shared by full frontend and waitlist+admin images.

location = /admin/index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    try_files $uri =404;
}

location ^~ /admin/assets/ {
    try_files $uri =404;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Strip trailing slash on admin sub-routes (not bare /admin/).
rewrite ^(/admin/.+)/$ $1 permanent;

location /admin/ {
    try_files $uri /admin/index.html;
}

location = /admin {
    return 301 /admin/$is_args$args;
}

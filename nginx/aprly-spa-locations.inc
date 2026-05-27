# Landing static assets (root build).
location /assets/ {
    try_files $uri =404;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cabinet PWA (built with base /dashboard/).
location ^~ /dashboard/assets/ {
    try_files $uri =404;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* ^/dashboard/(?:sw\.js|workbox-[^/]+\.js|manifest-cabinet\.webmanifest)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    try_files $uri =404;
}

location /dashboard/ {
    try_files $uri $uri/ /dashboard/index.html;
}

# Cabinet Vite base is /dashboard/ — redirect bare /dashboard (keep query string).
location = /dashboard {
    return 301 /dashboard/$is_args$args;
}

# Admin SPA (built with base /admin/).
location ^~ /admin/assets/ {
    try_files $uri =404;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /admin/ {
    try_files $uri $uri/ /admin/index.html;
}

location = /admin {
    return 302 /admin/;
}

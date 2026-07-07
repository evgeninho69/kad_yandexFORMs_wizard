FROM nginx:1.27-alpine

# Static wizard form for 2KAD yandexFORMs.
# No build step — pure HTML + CSS + JS.

RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY app.js /usr/share/nginx/html/app.js

# SPA-friendly nginx config: try file, then index.html.
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 256;
  add_header Cache-Control "public, max-age=300" always;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF

EXPOSE 80

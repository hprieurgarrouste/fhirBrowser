FROM nginx:alpine
COPY index.html fhirBrowser.js service-worker.js default.conf manifest.json /usr/share/nginx/html/
COPY assets/*  /usr/share/nginx/html/assets/
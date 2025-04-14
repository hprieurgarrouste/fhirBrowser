FROM nginx
COPY index.html fhirBrowser.js service-worker.js default.conf manifest.json /usr/share/nginx/html/
COPY assets/  /usr/share/nginx/html/assets/
RUN rm /etc/nginx/conf.d/default.conf
RUN echo "server {\
    listen 80;\
    root /usr/share/nginx/html;\
    index index.html;\
    }" > /etc/nginx/conf.d/default.conf
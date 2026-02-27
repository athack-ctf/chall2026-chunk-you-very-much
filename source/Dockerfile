FROM mitmproxy/mitmproxy:6.0.2
WORKDIR /app

RUN pip3 install --no-cache-dir --upgrade \
    gunicorn==20.0.4 \
    Flask==2.2.5 \
    Werkzeug==2.2.3

COPY gunicornserver/app.py /app/server/app.py

COPY gunicornserver/templates /app/server/templates

COPY gunicornserver/static /app/server/static

COPY mitmproxy/filter.py /app/filter.py

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENV SERVER_HOSTNAME=127.0.0.1
ENV SERVER_PORT=8000

EXPOSE 8002

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]

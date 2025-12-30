FROM python:3

WORKDIR /app
RUN pip3 install -v gunicorn==20.0.4 Flask

COPY app.py ./app.py
COPY templates ./templates
COPY styles ./styles

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

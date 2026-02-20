from mitmproxy import http
from urllib.parse import urlsplit

ALLOWED_PATHS = {
    "/",          
    "/post/2",
    "/profile",
}

ALLOWED_PREFIXES = (
    "/styles/",   
    "/background.webp",
)

DANGEROUS_HEADERS = [
    "X-Original-URL",
    "X-Rewrite-URL",
    "X-Forwarded-Server",
    "X-Host",
    "X-Forwarded-Host",
    "X-Original-URI",
]

def _deny(flow: http.HTTPFlow) -> None:
    flow.response = http.HTTPResponse.make(
        404,
        b"If you are trying to reach /post/transmission, you are on the right track,\n"
        b"but you can't get there from here, nice try :), otherwise you are lost.\n",
        {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"},
    )

def request(flow: http.HTTPFlow) -> None:
    for header in DANGEROUS_HEADERS:
        if header in flow.request.headers:
            del flow.request.headers[header]

    path = urlsplit(flow.request.pretty_url).path or "/"


    if path in ALLOWED_PATHS:
        return

    for pref in ALLOWED_PREFIXES:
        if path.startswith(pref):
            return

    return _deny(flow)

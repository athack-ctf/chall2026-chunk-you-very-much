# @HACK 2026: Chunk You Very Much

> A deliberately vulnerable web challenge that explores HTTP parsing mismatches and trust boundaries between frontend and backend servers. This challenge depends on HTTP request smuggling.

## Challenge Type

- [ ] **OFF**line
- [X] **ON**line

## Design Type

- [X] **Black**-Box
- [ ] **White**-Box

## Designer(s)

- Tarek Hamze

## Description

This challenge is based on **HTTP request smuggling**, which is a technique for interfering with the way a web site processes sequences of HTTP requests that are received from one or more users. In modern websites, it is crucial that the front-end and back-end systems agree about the boundaries between requests. Otherwise, an attacker might be able to send an ambiguous request that gets interpreted differently by the front-end and back-end systems.

In the challenge participants interact with a web application that appears to enforce strict routing and access controls, yet hides a protected endpoint that cannot be accessed through straightforward means such as a regular POST request.

The core idea is to expose participants to **request desynchronization / request smuggling** flaws, where HTTP messages are interpreted differently depending on which component (FE/BE) processes them. By carefully crafting requests that exploit ambiguities in request boundaries (HTTP headers namely *Transfer-Encoding* and *Content-Length), participants can cause the backend to process unintended input.

### Educational goals

The challenge is designed to test and reinforce the following skills:

- Understanding of **HTTP/1.1 request structure**
- Awareness of **frontend vs backend trust assumptions**
- Ability to identify and exploit **request desynchronization**
- Manual request crafting using tools such as Burp Repeater or curl

This challenge avoids obvious vulnerabilities and focuses on protocol-level thinking and
experimentation.

**IMPORTANT:** This description will **NOT** be shared with participants.

## Category(ies)

- `web`

---

# Project Structure

## 1. HACKME.md

- **[HACKME.md](HACKME.md)**: A description of the challenge to be shared with participants (in CTFd).

## 2. Source Code

- **[source/README.md](source/README.md)**: Comprehensive instructions on how to have a running instance of your
  challenge from the source.
- **[source/*](source/)**: Your source code.

## 3. Offline Artifacts [OPTIONAL]

## 4. Solution

- **[solution/README.md](solution/README.md)**: A detailed writeup of the working solution.
- **[solution/FLAGS.md](solution/FLAGS.md)**: A single markdown file listing all (up-to-date) flags.
- **[solution/*](solution/)**: Any additional files or code necessary for constructing a reproducible solution for the
  challenge.

## 5. Dockerization

> **NOTE:** For deployment on @Hack's infrastructure, online challenges must be containerized. However, this requirement
> does not apply during the early stages of challenge development, so do not hesitate to start building your online
> challenge if you are unfamiliar with containerization. We (Anis and Hugo) will take care of it.

- **[source/gunicorn/Dockerfile](source/Dockerfile)**: Needed for building a containerized image of the backend server.
- **[source/mitmproxy/Dockerfile](source/Dockerfile)**: Needed for building a containerized image of the frontend server.
- **[source/docker-compose.yml](source/docker-compose.yml)**: Needed for a configuration-free run of the online
  challenge.

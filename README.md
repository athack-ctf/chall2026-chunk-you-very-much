# @Hack 2026: Chunk You Very Much

> Authored by [Tarek](https://github.com/tarek503).

- **Category**: `Web`
- **Solves**: `17/120`
- **Tags**: `sponsored`
- **Protocol**: `http`

> At @HACK 2026, the organizers hired **Groot** as the new guardian for the transmission relay station, where ***only***
> space pirates can exchange information.
>
> He stands at the *gateway*, checks every request, and proudly blocks anything that looks "wrong". Meanwhile, the
> backend behind him is actually doing real work… it doesn't always interpret requests the same way Groot does.
>
> Your objective is simple: Somewhere behind the "I am Groot" filter is a protected action (a *transmission*) that
> should not be reachable directly, reach it and recover the flag.
>
> > Hint: The frontend and backend may disagree on **where one request ends and the next begins**.
>

## Access a dockerized instance

Run challenge container using docker compose

```
docker compose up -d
```

Open below URL on your browser

```
http://localhost:53003/
```

<details>
<summary>
How to stop/restart challenge?
</summary>

To stop the challenge run

```
docker compose stop
```

To restart the challenge run

```
docker compose restart
```

</details>

## Reveal Flag(s)

Did you try solving this challenge?
<details>
<summary>
Yes
</summary>

Did you **REALLY** try solving this challenge?

<details>
<summary>
Yes, I promise!
</summary>

- Flag 1: `ATHACKCTF{I_t0Ld_Y0U_n0t_T0_TrUsT_tH3_pR0xy}`

</details>
</details>


---

## About @Hack

[@Hack](https://athackctf.com/) is an annual CTF (Capture The Flag) competition hosted
by [HEXPLOIT ALLIANCE](https://hexploit-alliance.com/) and [TECHNATION](https://technationcanada.ca/) at Concordia
University in Montreal, Canada.

---
[Check more challenges from @Hack 2026](https://github.com/athack-ctf/AtHackCTF-2026-Challenges).

from flask import Flask, request, redirect, Response
from pathlib import Path
from html import escape as html_escape
import os

BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"


app = Flask(__name__, static_folder="styles", static_url_path="/styles")


COMMENTS = [{"post_id": 2, "author": "Groot", "text": "If you can read this transmission, you can post one yourself, I am Groot!"},
            {"post_id": 2, "author": "Groot", "text": "The payload of a transmission looks like this: postId=2&name=string&transmission=string\nI am Groot!"}
             ]

VICTIM_SESSION = os.environ["VICTIM_SESSION"]  
FLAG = os.environ.get("FLAG", "ATHACK{I_t0Ld_Y0U_n0t_T0_TrUsT_tH3_pR0xy}")


def render_template_file(filename: str, **ctx) -> str:
    """
    Tiny templating compatible with your HTML files:
    replaces {{key}} with ctx[key] (string).
    """
    text = (TEMPLATES_DIR / filename).read_text(encoding="utf-8")
    for k, v in ctx.items():
        text = text.replace("{{" + k + "}}", str(v))
    return text


def render_page(title: str, content_template: str, **ctx) -> str:
    content = render_template_file(content_template, **ctx)
    return render_template_file(
        "layout.html",
        title=html_escape(title),
        content=content,  
    )


def read_local_file(name: str) -> str:
    p = BASE_DIR / name
    if not p.exists() or not p.is_file():
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


@app.get("/")
def root():
    return redirect("/post/2")


@app.get("/post/2")
def post2():
    post_comments = [c for c in COMMENTS if c.get("post_id") == 2]
    cards = []
    for c in post_comments:
        author = html_escape(c.get("author", "anonymous alien"))
        text = html_escape(c.get("text", ""))
        cards.append(
            f"""
            <div class="comment">
              <div class="comment-head">[{author}]</div>
              <pre class="comment-body">{text}</pre>
            </div>
            """.strip()
        )

    comments_html = "\n".join(cards) if cards else "<p class='muted'>No transmissions yet.</p>"

    html = render_page(
        title="Transmission #3",
        content_template="post2.html",
        comments=comments_html,
        comments_count=str(len(post_comments)),
    )
    return Response(html, mimetype="text/html; charset=utf-8")


from urllib.parse import parse_qs

@app.post("/post/transmission")
def post_comment():
    raw = request.get_data(cache=False) or b""
    print(raw)
    body = raw.decode("utf-8", errors="replace").strip()

    if request.form:
        post_id = int(request.form.get("postId", "2") or 2)
        name = (request.form.get("name") or "anonymous alien").strip()
        transmission = (request.form.get("transmission") or "").strip()
    else:
        params = parse_qs(body, keep_blank_values=True)
        post_id = int((params.get("postId", ["2"])[0] or "2"))
        name = (params.get("name", ["anonymous alien"])[0] or "anonymous alien").strip()
        transmission = (params.get("transmission", [""])[0] or "").strip()

    COMMENTS.append({"post_id": post_id, "author": name, "text": transmission})
    COMMENTS.append({"post_id": post_id, "author": "Groot", "text": "You smuggled a request! Here is your reward: session=" + VICTIM_SESSION})
    return redirect("/post/2", code=302)




@app.get("/profile")
def profile():
    session = request.cookies.get("session", "")
    if session == VICTIM_SESSION:
        msg = f"The relay station really is unstable, nicely played.\nFLAG: {FLAG}\n"
    else:
        msg = "Access to classified data denied.\n"

    html = render_page(
        title="Crew Dossier",
        content_template="profile.html",
        message=html_escape(msg),
    )
    return Response(html, mimetype="text/html; charset=utf-8")


@app.get("/flag")
def flag():
    return Response(read_local_file("flag") or FLAG, mimetype="text/plain; charset=utf-8")

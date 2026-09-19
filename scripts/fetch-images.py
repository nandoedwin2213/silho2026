"""Descarga imágenes libres (Unsplash License) para el sitio a public/images."""
import json, os, subprocess, urllib.request, urllib.parse

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)

QUERIES = {
    "hero": "elegant woman face skin beauty portrait natural light",
    "clinic": "modern aesthetic clinic interior",
    "consultation": "doctor consultation patient medical office",
    "doctor": "doctor stethoscope white coat portrait clinic",
    "agenda": "receptionist clinic calendar appointment",
    "membresias": "spa wellness towels candles",
    "quito": "Quito Ecuador city",
    "guayaquil": "Guayaquil Ecuador skyline river",
    "salinas": "Salinas Ecuador beach",
    "cat-valoracion": "dermatologist examining patient skin face",
    "cat-toxina-botulinica": "botox injection forehead aesthetic",
    "cat-acido-hialuronico": "lip filler injection aesthetic",
    "cat-acne": "clear skin close up woman face",
    "cat-cicatrices-acne": "microneedling facial treatment",
    "cat-rejuvenecimiento-facial": "laser facial treatment clinic",
    "cat-medicina-capilar": "hair scalp treatment clinic",
    "cat-trasplante-capilar": "hair transplant procedure",
    "cat-blefaroplastia": "close up eyes woman beauty",
    "cat-rinoplastia": "profile nose woman portrait studio",
    "cat-perfilamiento-facial": "jawline profile woman portrait",
    "cat-otros-procedimientos": "cosmetic dermatology device treatment",
    "blog-acne": "skincare routine serum",
    "blog-rejuvenecimiento": "woman 40s natural beauty portrait smile",
    "blog-acido-hialuronico": "dropper serum skin hydration",
    "blog-botox": "aesthetic injection clinic",
    "blog-capilar": "healthy hair woman",
    "blog-cicatrices": "dermatology skin close up texture",
    "blog-laser": "laser beauty device clinic",
    "blog-armonizacion-facial": "beauty face symmetry portrait studio",
}

PICK = json.loads(os.environ.get("PICK", "{}"))
CREDITS = {}

def search(q):
    url = "https://unsplash.com/napi/search/photos?" + urllib.parse.urlencode({"query": q, "per_page": 12, "orientation": "landscape"})
    return json.loads(subprocess.check_output(["curl", "-s", url]))["results"]

for key, q in QUERIES.items():
    dest = os.path.join(OUT, f"{key}.jpg")
    results = [r for r in search(q) if "plus.unsplash.com" not in r["urls"]["raw"]]
    idx = PICK.get(key, 0)
    r = results[idx]
    base = r["urls"]["raw"].split("?")[0]
    subprocess.check_call(["curl", "-sL", "-o", dest, base + "?w=1600&q=78&fm=jpg&fit=crop"])
    CREDITS[key] = {"id": r["id"], "author": r["user"]["name"], "url": r["links"]["html"], "alt": r.get("alt_description")}
    print(key, r["id"], r["user"]["name"], "-", r.get("alt_description"))

with open(os.path.join(OUT, "credits.json"), "w") as f:
    json.dump(CREDITS, f, ensure_ascii=False, indent=2)

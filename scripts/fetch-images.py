"""Descarga imágenes libres (Unsplash License) para el sitio a public/images."""
import json, os, subprocess, urllib.parse

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)

QUERIES = {
    "hero": "elegant woman face skin beauty portrait natural light",
    "clinic": "modern aesthetic clinic interior",
    "consultation": "doctor consultation patient medical office",
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
    "route-rejuvenecimiento": "mature woman glowing skin natural portrait",
    "route-acne": "young woman clear skin close up dermatology",
    "route-cicatrices": "skin texture close up dermatology treatment",
    "svc-labios": "natural lips facial aesthetic clinic portrait",
    "svc-pomulos": "cheekbone facial aesthetic portrait",
    "svc-menton-mandibula": "jawline chin facial profile aesthetic portrait",
    "svc-ojeras": "under eye skincare dermatology close up",
    "svc-nariz": "nose profile facial aesthetic portrait",
    "svc-frente-entrecejo": "forehead facial expression dermatology portrait",
    "svc-patas-de-gallo": "smiling eyes crow feet natural portrait",
    "svc-sonrisa": "smile facial aesthetic portrait natural",
    "svc-maseteros-bruxismo": "jaw muscle facial anatomy portrait",
    "svc-cuello-papada": "neck jawline skincare portrait natural",
    "svc-limpieza-facial": "professional facial cleansing treatment clinic",
    "svc-peeling": "facial peel treatment",
    "svc-microneedling-dermapen": "microneedling facial dermatology clinic",
    "svc-prp": "platelet rich plasma facial dermatology clinic",
    "svc-laser": "laser dermatology facial treatment clinic",
    "svc-subcision": "acne scar dermatology treatment close up",
    "svc-bioestimuladores": "collagen stimulation facial aesthetic clinic",
    "svc-hilos": "facial thread lift aesthetic clinic treatment",
    "svc-skinboosters-hidratacion": "skin hydration facial treatment clinic",
    "svc-valoracion": "doctor evaluating patient face dermatology clinic",
    "svc-plan-integral": "doctor planning facial treatment consultation",
    "svc-manchas-melasma": "hyperpigmentation melasma dermatology close up",
    "svc-rosacea": "rosacea sensitive skin dermatology close up",
    "svc-poros-textura": "facial skin pores texture dermatology close up",
    "svc-flacidez": "firming facial skin treatment mature woman",
    "svc-manos": "hand rejuvenation dermatology treatment clinic",
    "svc-tercio-medio": "facial anatomy portrait",
    "svc-full-face": "full face facial aesthetic consultation portrait",
    "svc-cejas": "eyebrow facial aesthetic natural portrait",
    "svc-capilar": "hair scalp dermatology treatment clinic",
}

PICK = json.loads(os.environ.get("PICK", "{}"))
PICK_ID = json.loads(os.environ.get("PICK_ID", "{}"))
ONLY = {key.strip() for key in os.environ.get("ONLY", "").split(",") if key.strip()}
CREDITS_PATH = os.path.join(OUT, "credits.json")
with open(CREDITS_PATH) as f:
    CREDITS = json.load(f)

selected = set(QUERIES) if not ONLY else ONLY & set(QUERIES)
CACHE = {entry["id"] for key, entry in CREDITS.items() if key not in selected}

def search(q):
    results = []
    queries = [q]
    for term in ("clinic", "dermatology", "aesthetic", "treatment"):
        variant = q.replace(term, "").replace("  ", " ").strip()
        if variant and variant not in queries:
            queries.append(variant)
    for query in queries:
        for page in range(1, 4):
            url = "https://unsplash.com/napi/search/photos?" + urllib.parse.urlencode({"query": query, "per_page": 30, "page": page, "orientation": "landscape"})
            results.extend(json.loads(subprocess.check_output(["curl", "--retry", "3", "--retry-all-errors", "-s", url]))["results"])
        if results:
            break
    return results

def is_free(r):
    return "plus.unsplash.com" not in r["urls"]["raw"]

def photo(photo_id):
    url = f"https://unsplash.com/napi/photos/{urllib.parse.quote(photo_id)}"
    return json.loads(subprocess.check_output(["curl", "--retry", "3", "--retry-all-errors", "-s", url]))

for key, q in QUERIES.items():
    if key not in selected:
        continue
    dest = os.path.join(OUT, f"{key}.jpg")
    if key in PICK_ID:
        r = photo(PICK_ID[key])
        if r.get("id") != PICK_ID[key]:
            raise RuntimeError(f"Unsplash photo ID mismatch for {key}")
        if r.get("id") in CACHE:
            raise RuntimeError(f"Unsplash photo ID already used for {key}: {r['id']}")
        if not (r.get("alt_description") or r.get("description")):
            raise RuntimeError(f"Unsplash photo has no alt text for {key}: {r['id']}")
        if not is_free(r):
            raise RuntimeError(f"Unsplash+ photo not allowed for {key}: {r['id']}")
    else:
        results = [
            r for r in search(q)
            if r.get("id") not in CACHE
            and is_free(r)
            and (r.get("alt_description") or r.get("description"))
        ]
        idx = PICK.get(key, 0)
        if len(results) <= idx:
            raise RuntimeError(f"No unique image with alt text found for {key}")
        r = results[idx]
    base = r["urls"]["raw"].split("?")[0]
    subprocess.check_call(["curl", "--fail", "-sL", "-o", dest, base + "?w=1600&q=78&fm=jpg&fit=crop"])
    CACHE.add(r["id"])
    CREDITS[key] = {"id": r["id"], "author": r["user"]["name"], "url": r["links"]["html"], "alt": r.get("alt_description") or r.get("description")}
    print(key, r["id"], r["user"]["name"], "-", r.get("alt_description") or r.get("description"))

with open(CREDITS_PATH, "w") as f:
    json.dump(CREDITS, f, ensure_ascii=False, indent=2)

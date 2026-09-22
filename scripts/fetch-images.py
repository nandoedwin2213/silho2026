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
    "svc-toxina-botulinica-menton-empedrado": "chin close up woman face skin",
    "svc-acido-hialuronico-mandibula": "defined jawline woman side profile portrait",
    "svc-perfilamiento-facial-jawline": "sharp jawline man portrait studio",
    "svc-perfilamiento-facial-menton": "chin profile woman portrait light",
    "svc-perfilamiento-facial-perfil-mandibular": "woman profile side face dark background",
    "svc-perfilamiento-facial-perfilamiento-mandibular": "jaw contour beauty portrait black and white",
    "svc-acne-peeling-de-fenol-superficial": "chemical peel facial mask application spa",
    "svc-acne-peeling-quimico": "facial mask brush application esthetician",
    "svc-cicatrices-acne-peeling-de-fenol": "cosmetologist applying serum face treatment",
    "svc-cicatrices-acne-peeling-quimico": "face exfoliation treatment beauty salon",
    "svc-cicatrices-acne-tca-cross": "skin close up cheek texture macro",
    "svc-acne-control-de-piel-grasa": "face cleansing foam wash woman",
    "svc-acne-programa-silho-acne-1-mes": "teenager clear skin portrait natural light",
    "svc-acne-programa-silho-acne-3-meses": "young man skincare face portrait",
    "svc-acne-programa-silho-acne-6-meses": "woman healthy glowing skin smiling portrait",
    "svc-acne-seguimiento-mensual": "doctor patient consultation tablet clinic",
    "svc-acne-tratamiento-combinado-de-acne": "skincare products bottles flat lay",
    "svc-acne-dermapen": "dermapen microneedling device face",
    "svc-cicatrices-acne-microneedling": "microneedling cheek close up treatment",
    "svc-rejuvenecimiento-facial-dermapen": "skin needling pen aesthetic procedure",
    "svc-rejuvenecimiento-facial-microneedling": "collagen induction therapy facial",
    "svc-rejuvenecimiento-facial-botox": "botox injection forehead woman clinic",
    "svc-rejuvenecimiento-facial-hifu": "ultrasound face lifting device treatment",
    "svc-rejuvenecimiento-facial-radiofrecuencia": "radiofrequency facial treatment device",
    "svc-rejuvenecimiento-facial-radiofrecuencia-fraccionada": "aesthetic device face treatment clinic close up",
    "svc-rejuvenecimiento-facial-acido-hialuronico": "hyaluronic acid syringe face filler",
    "svc-perfilamiento-facial-feminizacion": "feminine soft face portrait woman elegant",
    "svc-perfilamiento-facial-masculinizacion": "masculine face man portrait strong jaw",
    "svc-perfilamiento-facial-perfiloplastia-no-quirurgica": "woman face profile golden ratio beauty",
    "svc-perfilamiento-facial-surcos": "nasolabial fold face close up mature woman",
    "svc-perfilamiento-facial-tercio-inferior": "lower face lips chin close up",
    "svc-acne-prp": "blood plasma tubes laboratory centrifuge",
    "svc-cicatrices-acne-prp": "prp injection face dermatology",
    "svc-rejuvenecimiento-facial-pdrn": "regenerative skin serum ampoule",
    "svc-toxina-botulinica-full-face-botox": "woman face wrinkle free portrait studio",
    "svc-acido-hialuronico-full-face-con-acido-hialuronico": "facial harmony woman portrait symmetric",
    "svc-rejuvenecimiento-facial-full-face-personalizado": "facial mapping aesthetic consultation marking",
    "svc-cicatrices-acne-bioestimulacion": "skin regeneration close up glowing",
    "svc-rejuvenecimiento-facial-hidroxiapatita-de-calcio": "syringe aesthetic medicine gloves",
    "svc-rejuvenecimiento-facial-acido-polilactico": "mature woman firm skin portrait elegant",
    "svc-toxina-botulinica-afinamiento-facial": "slim face woman portrait v shape",
    "svc-toxina-botulinica-botox-masculino": "man receiving botox injection",
    "svc-toxina-botulinica-botox-preventivo": "young woman smooth forehead portrait",
    "svc-toxina-botulinica-tercio-superior": "forehead eyes upper face close up woman",
    "svc-rejuvenecimiento-facial-tratamiento-de-ojeras": "under eye patches skincare woman",
    "svc-perfilamiento-facial-ojeras": "eyes close up woman rested skin",
    "svc-acne-laser-co2-fraccionado": "laser skin resurfacing clinic goggles",
    "svc-cicatrices-acne-laser-co2-fraccionado": "fractional laser device dermatology",
    "svc-acido-hialuronico-aumento-de-labios": "lip injection filler aesthetic",
    "svc-perfilamiento-facial-labios": "full lips close up natural beauty",
    "svc-toxina-botulinica-bunny-lines": "nose wrinkles close up woman face",
    "svc-toxina-botulinica-entrecejo": "frown lines between eyebrows close up",
    "svc-cicatrices-acne-programa-avanzado-de-cicatrices": "acne scars skin close up",
    "svc-cicatrices-acne-terapia-combinada": "dermatologist treatment plan clinic",
    "svc-cicatrices-acne-acido-hialuronico-para-cicatrices-seleccionadas": "cheek skin close up dermal filler",
    "svc-cicatrices-acne-evaluacion-de-cicatrices": "dermatologist magnifier examining skin",
    "svc-rejuvenecimiento-facial-profhilo": "hydrated dewy skin woman face close up",
    "svc-perfilamiento-facial-pomulos": "high cheekbones woman portrait light",
    "svc-cicatrices-acne-protocolo-para-cicatrices-de-acne": "clinic treatment plan doctor writing",
    "svc-perfilamiento-facial-nariz": "nose profile close up woman side",
    "svc-toxina-botulinica-maseteros": "jaw clenching man face profile",
    "svc-knee-hyaluron": "knee physiotherapy consultation healthy movement",
    "svc-knee-hyaluron-2": "woman walking knee joint health physiotherapy",
    "svc-joint-prp": "knee joint health movement clinic",
    "svc-medical-imaging-rx": "doctor reviewing x ray radiograph clinic",
    "svc-medical-imaging-eco": "doctor using ultrasound scanner medical consultation",
    "svc-metabolic-heart-check": "doctor reviewing electrocardiogram stethoscope clinic",
    "cat-medicina-articular": "knee physiotherapy medical consultation",
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

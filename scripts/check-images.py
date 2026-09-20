"""Valida créditos, archivos y licencia de las imágenes del sitio."""
import hashlib
import json
import subprocess
import time
import urllib.parse
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "public" / "images"
CREDITS_PATH = IMAGES / "credits.json"


def fetch_photo(photo_id):
    url = f"https://unsplash.com/napi/photos/{urllib.parse.quote(photo_id)}"
    output = subprocess.check_output(["curl", "--fail", "--retry", "3", "--retry-all-errors", "-sS", url], text=True)
    return json.loads(output)


def is_jpeg(path):
    data = path.read_bytes()
    return len(data) > 20 * 1024 and data[:2] == b"\xff\xd8" and data[-2:] == b"\xff\xd9"


def main():
    credits = json.loads(CREDITS_PATH.read_text())
    entries = list(credits.items())
    ids = [entry["id"] for _, entry in entries]
    assert len(ids) == len(set(ids)), "duplicate Unsplash IDs"

    digests = {}
    for key, entry in entries:
        path = IMAGES / f"{key}.jpg"
        assert path.exists(), f"missing image: {path}"
        assert is_jpeg(path), f"invalid JPEG or image too small: {path}"
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        assert digest not in digests, f"byte-identical images: {digests[digest]} and {path}"
        digests[digest] = path

    plus = []
    for index, (key, entry) in enumerate(entries, 1):
        data = fetch_photo(entry["id"])
        raw = data.get("urls", {}).get("raw", "")
        if data.get("plus") or "plus.unsplash.com" in raw:
            plus.append((key, entry["id"]))
        print(f"{index}/{len(entries)} {key}: {entry['id']}", flush=True)
        time.sleep(0.12)

    assert not plus, f"Unsplash+ photos: {plus}"
    print(f"OK: {len(entries)} credits, unique IDs, valid JPEGs, unique bytes, no Unsplash+ photos")


if __name__ == "__main__":
    main()

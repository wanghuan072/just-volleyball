"""Stage public community records, then publish only checked, rendered looks."""

import argparse
import base64
import hashlib
import json
import re
import shutil
import unicodedata
import zlib
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def slug_for(name, record_id, taken):
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")[:58].rstrip("-")
    if not slug or slug in taken:
        return f"{slug or 'look'}-{record_id}"
    return slug


def checked_payload(code):
    if not re.fullmatch(r"JV2:[A-Za-z0-9_-]+", code):
        return None
    payload = base64.urlsafe_b64decode(code[4:] + "===")
    if len(payload) < 3 or int.from_bytes(payload[:2], "big") != (zlib.crc32(payload[2:]) & 65535):
        return None
    return payload[2:]


def stage(candidates, existing):
    taken = {r["slug"] for r in existing} | {"anime", "haikyuu"}
    ids = {r["id"] for r in existing}
    codes = {r["code"] for r in existing}
    rows = []
    for row in candidates:
        if row["id"] in ids or row["code"] in codes or not checked_payload(row["code"]):
            continue
        slug = slug_for(row["name"], row["id"], taken)
        taken.add(slug)
        ids.add(row["id"])
        codes.add(row["code"])
        rows.append({**row, "slug": slug})
    return rows


def publish(rows, existing):
    directory = Path("artifacts/offline-render/output")
    accessories = {a["id"]: a for a in read("data/extracted-assets.json")["accessories"]["items"]}
    evidence = read("data/preset-evidence.json")
    renders = read("data/portrait-renders.json")
    additions = []
    records = []
    checked_at = datetime.now(timezone.utc).isoformat()
    for row in rows:
        slug = row["slug"]
        if not (directory / f"{slug}.json").is_file() or not (directory / f"{slug}.png").is_file():
            continue
        output = read(directory / f"{slug}.json")
        source = directory / f"{slug}.png"
        code_hash = hashlib.sha256(row["code"].encode()).hexdigest()
        if output["codeSha256"] != code_hash or not output.get("config") or output["saveError"]:
            continue
        with Image.open(source) as image:
            bounds = image.getchannel("A").getbbox()
            if image.size != (960, 1240) or not bounds or min(bounds[0], bounds[1], 960-bounds[2], 1240-bounds[3]) < 16:
                continue
        config = output["config"]
        ids = list(dict.fromkeys(item["id"] for item in config.get("acc", {}).values() if item.get("id")))
        if any(item_id not in accessories for item_id in ids):
            continue
        required = [{"id": key, "displayName": accessories[key]["displayName"], "price": accessories[key]["price"]} for key in ids]
        tags = list(dict.fromkeys(t.lower() for t in row["tags"]))
        image_url = f"/images/players/{slug}.png"
        additions.append({
            "id": row["id"], "slug": slug, "name": row["name"],
            "description": f"Preview the {row['name']} community appearance for Just Volleyball, copy its JV2 code and check the accessories used in the look.",
            "category": tags[0] if tags else "community", "tags": tags or ["community"],
            "image": image_url, "creator": None if row["account"] == "@community" else row["account"],
            "sourceAccount": row["account"], "sourceUrl": f"https://jvlocker.com/s/{row['id']}",
            "sourceCheckedAt": checked_at, "updatedAt": checked_at, "verified": False,
            "rightsNote": "This community appearance is credited to its source listing.",
        })
        evidence[slug] = {
            "codecRevision": checked_payload(row["code"])[0] >> 6,
            "crcValid": True, "resourceMatch": True, "gameVersion": "1.0.3", "gameTested": False,
            "decoded": {"hairId": config["hair"], "hairColor": (config.get("hcols") or [config["hcol"]])[0] or config["hcol"], "hairColors": config.get("hcols", []), "jerseyNumber": config["num"], "kitColors": config["kh"]},
            "requiredAccessories": required, "accessoryCost": sum(item["price"] for item in required),
        }
        render = {
            "slug": slug, "image": image_url, "width": 960, "height": 1240,
            "codeSha256": code_hash, "imageSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "gameResourcesVersion": "1.0.3", "engine": "Godot 4.8-dev (GDRE)",
            "modelPath": output["modelPath"], "sourceFunction": "game/character/character_portrait.gd:426",
            "cameraDistance": output["cameraDistance"], "cameraLook": output["cameraLook"],
            "pose": "game portrait pose, single front view", "gameImportTested": False,
            "rendered": True, "alphaBounds": list(bounds),
        }
        records.append((source, image_url, render))
        additions[-1]["code"] = row["code"]
        if len(additions) + len(existing) == 50:
            break
    if len(additions) + len(existing) != 50:
        raise RuntimeError(f"Only {len(additions) + len(existing)} eligible community looks. Add more verified sources.")
    for source, image_url, render in records:
        shutil.copyfile(source, Path("public") / image_url.lstrip("/"))
        renders["items"] = [item for item in renders["items"] if item["slug"] != render["slug"]] + [render]
    write("data/community-skins.json", additions)
    write("data/preset-evidence.json", evidence)
    write("data/portrait-renders.json", renders)
    print(f"Published {len(additions) + len(existing)} looks.")


parser = argparse.ArgumentParser()
parser.add_argument("operation", choices=("stage", "publish"))
args = parser.parse_args()
existing = read("data/skins.json")
staged = "artifacts/offline-render/community-input.json"
if args.operation == "stage":
    rows = stage(read("artifacts/package-audit/jvlocker-catalog-candidates.json"), existing)
    write(staged, rows)
    print(f"Staged {len(rows)} new checksum-valid source records.")
else:
    publish(read(staged), existing)

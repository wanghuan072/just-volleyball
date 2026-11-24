import argparse
import json
from pathlib import Path
import re

STRING = r'"(?:[^"\\]|\\.)*"'


def resource(path):
    body = path.read_text(encoding="utf-8-sig").split("[resource]", 1)[1]
    values = re.findall(rf"^(\w+) = ({STRING}|-?\d+|true|false)$", body, re.M)
    return {key: json.loads(value) for key, value in values}


def stage_has_venue(game, stages, stage):
    info = stages[stage]
    venue = re.search(rf'"venue": ({STRING})', info)
    if venue:
        path = game.parent / json.loads(venue[1]).removeprefix("res://")
        return path.is_file() or path.with_suffix(path.suffix + ".remap").is_file()
    base = re.search(rf'"base": ({STRING})', info)
    return bool(base and stage_has_venue(game, stages, json.loads(base[1])))


def build_catalog(game, version):
    title_defaults = (game / "titles/title_item.gd").read_text(encoding="utf-8")
    effect_defaults = (game / "titles/title_effect.gd").read_text(encoding="utf-8")
    title_price = int(re.search(r"@export var price: = (\d+)", title_defaults)[1])
    effect_price = int(re.search(r"@export var price: = (\d+)", effect_defaults)[1])
    max_text = int(re.search(r"const TEXT_MAX: = (\d+)", (game / "titles/title_catalog.gd").read_text(encoding="utf-8"))[1])

    achievement_source = (game / "core/achievement_catalog.gd").read_text(encoding="utf-8")
    achievements = {
        json.loads(id_text): json.loads(description)
        for id_text, description in re.findall(
            rf"AchievementDef\.new\(({STRING}),\s*{STRING},\s*({STRING})", achievement_source
        )
    }
    stage_source = (game / "stage/stage.gd").read_text(encoding="utf-8").split("const STAGES:", 1)[1]
    stages = dict(re.findall(r'^\t"([^"]+)": \{(.*?)^\t\}', stage_source, re.M | re.S))
    seen = set()
    titles = []
    for path in sorted((game / "titles/items").glob("*.tres")):
        item = resource(path)
        item_id = item.get("id") or path.stem
        name = item.get("text", "")
        if not name.strip() or len(name) > max_text or item_id in seen:
            continue
        seen.add(item_id)
        requirement = item.get("from_achievement")
        price = item.get("price", title_price)
        if not item.get("exclusive") and (requirement or price > 0):
            row = {"id": item_id, "name": name, "price": None if requirement else price}
            if requirement:
                row["achievementId"] = requirement
                if requirement in achievements:
                    row["requirement"] = achievements[requirement]
            titles.append(row)

    effects = []
    free_effects = []
    for path in sorted((game / "titles/effects").glob("*.tres")):
        effect = resource(path)
        price = effect.get("price", effect_price)
        stage = effect.get("stage")
        if stage and (re.search(r'"hidden": true', stages[stage]) or not stage_has_venue(game, stages, stage)):
            continue
        row = {"id": effect.get("id") or path.stem, "name": effect["label"], "price": price}
        if price > 0:
            effects.append(row)
        elif price == 0:
            free_effects.append(row)

    return {"gameVersion": version, "titles": titles, "effects": effects, "freeEffects": free_effects}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract the full-release Shop title and effect shelves.")
    parser.add_argument("project", type=Path, help="Unpacked project root containing game/")
    parser.add_argument("version")
    args = parser.parse_args()
    catalog = build_catalog(args.project / "game", args.version)
    output = Path(__file__).resolve().parents[1] / "data/shop-catalog.json"
    with output.open("w", encoding="utf-8", newline="\n") as file:
        file.write(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


RAW_OUTPUT_PATH = Path("data/raw/poultry_market_raw.json")
MANUAL_JSON_PATH = Path("data/raw/poultry_market_source.json")
MANUAL_CSV_PATH = Path("data/raw/poultry_market_source.csv")
DATASET_URLS = [
    "https://data.moa.gov.tw/Service/OpenData/FromM/PoultryTransBoiledChickenData.aspx?IsTransData=1&UnitId=056",
    "https://data.moa.gov.tw/Service/OpenData/FromM/PoultryTransBoiledChickenData.aspx",
    "https://data.coa.gov.tw/Service/OpenData/FromM/PoultryTransBoiledChickenData.aspx?IsTransData=1&UnitId=056",
    "https://data.coa.gov.tw/Service/OpenData/FromM/PoultryTransBoiledChickenData.aspx",
]


def load_manual_source() -> list[dict[str, Any]] | None:
    if MANUAL_JSON_PATH.exists():
        payload = json.loads(MANUAL_JSON_PATH.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            return payload
        raise ValueError(f"Unexpected JSON format in {MANUAL_JSON_PATH}")

    if MANUAL_CSV_PATH.exists():
        with MANUAL_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as file:
            return list(csv.DictReader(file))

    return None


def fetch_dataset() -> list[dict[str, Any]]:
    manual_source = load_manual_source()
    if manual_source is not None:
        return manual_source

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }

    last_error: Exception | None = None
    for url in DATASET_URLS:
        request = Request(url, headers=headers)
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.load(response)
                if isinstance(payload, list):
                    return payload
                raise ValueError(f"Unexpected payload type from {url}: {type(payload)!r}")
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            last_error = error

    if RAW_OUTPUT_PATH.exists():
        return json.loads(RAW_OUTPUT_PATH.read_text(encoding="utf-8"))

    raise RuntimeError(f"Unable to fetch dataset from known URLs: {last_error}")


if __name__ == "__main__":
    data = fetch_dataset()
    RAW_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved {len(data)} records to {RAW_OUTPUT_PATH}")

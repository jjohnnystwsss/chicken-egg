import json
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Any

from fetch_data import RAW_OUTPUT_PATH, fetch_dataset


PROCESSED_OUTPUT_PATH = Path("data/processed/poultry_market_processed.json")
SITE_OUTPUT_PATH = Path("public/data/generated-insights.json")


def parse_date(raw: str) -> datetime:
    raw = raw.strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d"):
      try:
        return datetime.strptime(raw, fmt)
      except ValueError:
        pass

    if "/" in raw:
      parts = raw.split("/")
      if len(parts) == 3 and len(parts[0]) <= 3:
        year = int(parts[0]) + 1911
        return datetime(year, int(parts[1]), int(parts[2]))

    raise ValueError(f"Unsupported date format: {raw}")


def first_number(record: dict[str, Any], aliases: list[str]) -> float | None:
    for key in aliases:
      value = record.get(key)
      if value in (None, "", "-", "--"):
        continue

      text = str(value).replace(",", "").strip()
      try:
        return float(text)
      except ValueError:
        continue
    return None


def first_text(record: dict[str, Any], aliases: list[str]) -> str:
    for key in aliases:
      value = record.get(key)
      if value not in (None, ""):
        return str(value).strip()
    return ""


def moving_average(values: list[float], window: int) -> list[float]:
    result: list[float] = []
    for index in range(len(values)):
      start = max(0, index - window + 1)
      result.append(round(mean(values[start:index + 1]), 2))
    return result


def average_or_zero(values: list[float]) -> float:
    return round(mean(values), 2) if values else 0.0


def month_average(cleaned: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    buckets: dict[int, list[float]] = {month: [] for month in range(1, 13)}
    for item in cleaned:
      value = item.get(key)
      if value is None:
        continue
      buckets[item["date"].month].append(value)

    return [
      {
        "label": f"{month:02d} 月",
        "value": average_or_zero(buckets[month]),
      }
      for month in range(1, 13)
    ]


def find_peak(items: list[dict[str, Any]]) -> dict[str, Any]:
    return max(items, key=lambda item: item["value"]) if items else {"label": "-", "value": 0.0}


def find_trough(items: list[dict[str, Any]]) -> dict[str, Any]:
    positives = [item for item in items if item["value"] > 0]
    if not positives:
      return {"label": "-", "value": 0.0}
    return min(positives, key=lambda item: item["value"])


def difference(series: list[float], days: int) -> float:
    if len(series) <= days:
      return 0.0
    return round(series[-1] - series[-days - 1], 2)


def span(values: list[float]) -> float:
    if not values:
      return 0.0
    return round(max(values) - min(values), 2)


def build_payload(records: list[dict[str, Any]]) -> dict[str, Any]:
    cleaned = []
    for record in records:
      date_text = first_text(record, ["日期", "交易日期"])
      if not date_text:
        continue

      try:
        parsed_date = parse_date(date_text)
      except ValueError:
        continue

      cleaned.append(
        {
          "date": parsed_date,
          "dateLabel": parsed_date.strftime("%Y-%m-%d"),
          "lunar": first_text(record, ["農曆"]),
          "broilerLarge": first_number(
            record,
            [
              "白肉雞(2.0Kg以上)",
              "白肉雞(2.0Kg以上) (元/台斤)",
            ],
          ),
          "broilerMedium": first_number(
            record,
            [
              "白肉雞(1.75-1.95Kg)",
              "白肉雞(1.75-1.95Kg) (元/台斤)",
            ],
          ),
          "broilerRetail": first_number(
            record,
            [
              "白肉雞(門市價高屏)",
              "白肉雞(門市價高屏) (元/台斤)",
            ],
          ),
          "eggFarm": first_number(
            record,
            [
              "雞蛋(產地價)",
              "雞蛋(產地)",
              "雞蛋(產地價)(元/台斤)",
            ],
          ),
          "eggWholesale": first_number(
            record,
            [
              "雞蛋(大運輸價)",
              "雞蛋(大運輸)",
              "雞蛋(大運輸價)(元/台斤)",
            ],
          ),
        }
      )

    cleaned.sort(key=lambda item: item["date"])

    recent = cleaned[-30:]
    broiler_large_values = [item["broilerLarge"] for item in recent if item["broilerLarge"] is not None]
    broiler_medium_values = [item["broilerMedium"] for item in recent if item["broilerMedium"] is not None]
    egg_farm_values = [item["eggFarm"] for item in recent if item["eggFarm"] is not None]
    egg_wholesale_values = [item["eggWholesale"] for item in recent if item["eggWholesale"] is not None]

    broiler_spread_values = [
      round(item["broilerLarge"] - item["broilerMedium"], 2)
      for item in recent
      if item["broilerLarge"] is not None and item["broilerMedium"] is not None
    ]
    egg_spread_values = [
      round(item["eggWholesale"] - item["eggFarm"], 2)
      for item in recent
      if item["eggWholesale"] is not None and item["eggFarm"] is not None
    ]
    broiler_monthly = month_average(cleaned, "broilerLarge")
    egg_monthly = month_average(cleaned, "eggWholesale")
    broiler_peak = find_peak(broiler_monthly)
    broiler_trough = find_trough(broiler_monthly)
    egg_peak = find_peak(egg_monthly)
    egg_trough = find_trough(egg_monthly)
    recent_records = [
      {
        "date": item["dateLabel"],
        "lunar": item["lunar"],
        "broilerLarge": item["broilerLarge"],
        "broilerMedium": item["broilerMedium"],
        "eggFarm": item["eggFarm"],
        "eggWholesale": item["eggWholesale"],
      }
      for item in cleaned[-7:]
    ]

    payload = {
      "meta": {
        "dataset": "家禽交易行情(白肉雞/雞蛋)",
        "source": "政府資料開放平臺 data.gov.tw",
        "sourceUrl": "https://data.gov.tw/dataset/7536",
        "records": len(cleaned),
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "dateRange": {
          "start": cleaned[0]["dateLabel"] if cleaned else "",
          "end": cleaned[-1]["dateLabel"] if cleaned else "",
        },
      },
      "summary": {
        "latestDate": recent[-1]["dateLabel"] if recent else "",
        "broilerLarge": broiler_large_values[-1] if broiler_large_values else None,
        "broilerMedium": broiler_medium_values[-1] if broiler_medium_values else None,
        "eggFarm": egg_farm_values[-1] if egg_farm_values else None,
        "eggWholesale": egg_wholesale_values[-1] if egg_wholesale_values else None,
      },
      "signals": [
        {
          "label": "白肉雞近 7 日變化",
          "value": difference(broiler_large_values, 6),
          "suffix": "元/台斤",
        },
        {
          "label": "雞蛋大運輸價近 7 日變化",
          "value": difference(egg_wholesale_values, 6),
          "suffix": "元/台斤",
        },
        {
          "label": "白肉雞近 30 日波動區間",
          "value": span(broiler_large_values),
          "suffix": "元/台斤",
        },
        {
          "label": "雞蛋近 30 日波動區間",
          "value": span(egg_wholesale_values),
          "suffix": "元/台斤",
        },
      ],
      "series": {
        "broilerLarge": [
          {"date": item["dateLabel"][5:], "value": item["broilerLarge"]}
          for item in recent
          if item["broilerLarge"] is not None
        ],
        "eggWholesale": [
          {"date": item["dateLabel"][5:], "value": item["eggWholesale"]}
          for item in recent
          if item["eggWholesale"] is not None
        ],
        "broilerSpread": [
          {
            "date": item["dateLabel"][5:],
            "value": round(item["broilerLarge"] - item["broilerMedium"], 2),
          }
          for item in recent
          if item["broilerLarge"] is not None and item["broilerMedium"] is not None
        ],
        "eggSpread": [
          {
            "date": item["dateLabel"][5:],
            "value": round(item["eggWholesale"] - item["eggFarm"], 2),
          }
          for item in recent
          if item["eggWholesale"] is not None and item["eggFarm"] is not None
        ],
      },
      "spreads": [
        {
          "label": "白肉雞大規格 vs 中規格近 30 日平均價差",
          "value": average_or_zero(broiler_spread_values),
        },
        {
          "label": "雞蛋產地價 vs 大運輸價近 30 日平均價差",
          "value": average_or_zero(egg_spread_values),
        },
        {
          "label": "雞蛋大運輸價近 7 日移動平均",
          "value": moving_average(egg_wholesale_values, 7)[-1] if egg_wholesale_values else 0.0,
        },
      ],
      "seasonality": {
        "broilerLargeMonthly": broiler_monthly,
        "eggWholesaleMonthly": egg_monthly,
      },
      "highlights": [
        {
          "title": "白肉雞季節高點",
          "body": f"長期平均來看，白肉雞 2.0Kg 以上在 {broiler_peak['label']} 的平均價格最高，約 {broiler_peak['value']:.1f} 元/台斤。",
        },
        {
          "title": "雞蛋季節低點",
          "body": f"雞蛋大運輸價的月平均低點落在 {egg_trough['label']}，約 {egg_trough['value']:.1f} 元/台斤，可和供需淡旺季一起解讀。",
        },
        {
          "title": "全年波動對照",
          "body": f"白肉雞月均價高低差約 {broiler_peak['value'] - broiler_trough['value']:.1f} 元/台斤，雞蛋大運輸價高低差約 {egg_peak['value'] - egg_trough['value']:.1f} 元/台斤。",
        },
      ],
      "insights": [
        {
          "title": "白肉雞規格價差",
          "body": f"近 30 日平均價差約 {average_or_zero(broiler_spread_values):.2f} 元/台斤，可用來觀察不同規格需求是否同步變動。",
        },
        {
          "title": "雞蛋價格傳導",
          "body": f"近 30 日產地價與大運輸價平均價差約 {average_or_zero(egg_spread_values):.2f} 元/台斤，可延伸分析運輸與通路傳導。",
        },
        {
          "title": "資料更新範圍",
          "body": f"目前已整理 {len(cleaned)} 筆資料，時間範圍自 {cleaned[0]['dateLabel'] if cleaned else 'N/A'} 到 {cleaned[-1]['dateLabel'] if cleaned else 'N/A'}。",
        },
      ],
      "records": [
        {
          "date": item["dateLabel"],
          "lunar": item["lunar"],
          "broilerLarge": item["broilerLarge"],
          "broilerMedium": item["broilerMedium"],
          "broilerRetail": item["broilerRetail"],
          "eggFarm": item["eggFarm"],
          "eggWholesale": item["eggWholesale"],
        }
        for item in cleaned
      ],
      "recentRecords": recent_records,
    }

    return payload


def main() -> None:
    raw_records = fetch_dataset()
    payload = build_payload(raw_records)

    RAW_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROCESSED_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SITE_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    RAW_OUTPUT_PATH.write_text(json.dumps(raw_records, ensure_ascii=False, indent=2), encoding="utf-8")
    PROCESSED_OUTPUT_PATH.write_text(json.dumps(payload["records"], ensure_ascii=False, indent=2), encoding="utf-8")
    SITE_OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

from pathlib import Path
import json


def main() -> None:
    """Placeholder script for converting cleaned poultry data into website JSON."""
    output_dir = Path("public/data")
    output_dir.mkdir(parents=True, exist_ok=True)

    payload = {
        "status": "placeholder",
        "message": "Replace this with processed data generated from the Ministry of Agriculture dataset."
    }

    (output_dir / "generated-insights.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

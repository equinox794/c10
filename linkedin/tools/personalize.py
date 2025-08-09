#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
from typing import Dict, List

WORKSPACE_ROOT = Path("/workspace").resolve()
BASE_DIR = WORKSPACE_ROOT / "linkedin"
CONFIG_PATH = BASE_DIR / "personalize.config.json"
TEMPLATES_DIR = BASE_DIR / "outreach"
OUTPUT_DIR = BASE_DIR / "dist"

VARIABLE_KEYS: List[str] = [
    "COMPANY_NAME",
    "WEBSITE",
    "CONTACT_NAME",
    "EMAIL",
    "PHONE_WHATSAPP",
    "PORTS",
    "PAYMENT_TERMS",
    "TRIAL_QTY_MT",
    "MONTHLY_QTY_MT",
]

SUPPORTED_EXTENSIONS = {".md", ".txt"}


def load_config(config_path: Path) -> Dict[str, str]:
    if not config_path.exists():
        print(f"Config not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    with config_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    config = {}
    for key in VARIABLE_KEYS:
        value = str(data.get(key, ""))
        config[key] = value
    return config


def read_file_text(path: Path) -> str:
    with path.open("r", encoding="utf-8") as f:
        return f.read()


def write_file_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        f.write(content)


def replace_placeholders(text: str, variables: Dict[str, str]) -> str:
    replaced_text = text
    for key, value in variables.items():
        token = f"[{key}]"
        replaced_text = replaced_text.replace(token, value)
    return replaced_text


def collect_template_files(root: Path) -> List[Path]:
    files: List[Path] = []
    for dirpath, _, filenames in os.walk(root):
        for filename in filenames:
            path = Path(dirpath) / filename
            if path.suffix in SUPPORTED_EXTENSIONS:
                files.append(path)
    return files


def main() -> None:
    print("Loading config…")
    variables = load_config(CONFIG_PATH)

    missing = [k for k, v in variables.items() if not v.strip()]
    if missing:
        print("Warning: These variables are empty and will remain blank in output:")
        for k in missing:
            print(f"  - {k}")

    print(f"Scanning templates in: {TEMPLATES_DIR}")
    template_files = collect_template_files(TEMPLATES_DIR)
    if not template_files:
        print("No template files found.")
        sys.exit(0)

    print(f"Found {len(template_files)} template files. Generating output…")
    for template in template_files:
        rel_path = template.relative_to(BASE_DIR)
        out_path = OUTPUT_DIR / rel_path
        content = read_file_text(template)
        new_content = replace_placeholders(content, variables)
        write_file_text(out_path, new_content)
        print(f"Wrote: {out_path}")

    summary_path = OUTPUT_DIR / "SUMMARY.txt"
    summary_lines = [
        "Personalization summary:",
        "Variables used:",
    ]
    for key in VARIABLE_KEYS:
        val_preview = variables.get(key, "")
        if len(val_preview) > 60:
            val_preview = val_preview[:57] + "…"
        summary_lines.append(f"- {key}: {val_preview}")
    write_file_text(summary_path, "\n".join(summary_lines) + "\n")
    print(f"Summary written to: {summary_path}")


if __name__ == "__main__":
    main()
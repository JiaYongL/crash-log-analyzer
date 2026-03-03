"""
main.py — IDE Crash Log Analyser (Ollama-backed)

Usage:
    python main.py                        # analyse the built-in demo log
    python main.py --batch                # analyse all built-in demo logs
    python main.py --log "your log text"  # analyse a custom log string
    python main.py --file crash.log       # analyse a log file
    python main.py --dir /path/to/logs    # scan a directory for log files
    python main.py --list-models          # show locally available Ollama models
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import pandas as pd

# Allow running from the project root without installing as a package
sys.path.insert(0, os.path.dirname(__file__))

from analyzer import CrashLogAnalyzer
from config import DEFAULT_MODEL, LOG_FILE_PATTERNS
from log_scanner import find_log_files, group_by_top_level_dir, merge_log_files, preferred_files
from ollama_client import list_models


# ---------------------------------------------------------------------------
# Built-in demo logs (one per known root-cause category)
# ---------------------------------------------------------------------------

DEMO_LOGS: list[str] = [
    # 1 — Mac JBR Metal crash
    """\
java.lang.IllegalStateException: Error - unable to initialize Metal after recreation of graphics device. Cannot load metal library: No MTLDevice.
java.desktop/sun.awt.CGraphicsDevice.<init>(CGraphicsDevice.java:91)
Exception in NSApplicationAWT: java.lang.IllegalStateException: Error - unable to initialize Metal""",

    # 2 — Windows virtual memory exhausted
    """\
Native memory allocation (malloc) failed to allocate 1407664 bytes. Error detail: Chunk::new
Out of Memory Error (arena.cpp:191), pid=2680, tid=9240
# There is insufficient memory for the Java Runtime Environment to continue.""",

    # 3 — Physical RAM exhausted (has "Possible reasons" section)
    """\
# Native memory allocation (malloc) failed to allocate 1330048 bytes. Error detail: Chunk::new
# Possible reasons:
#   The system is out of physical RAM or swap space
#   This process is running with CompressedOops enabled, and the Java Heap may be blocking the growth of the native heap""",

    # 4 — chrome_elf.dll access violation
    """\
EXCEPTION_ACCESS_VIOLATION (0xc0000005) at pc=0x0000000000000000, pid=928, tid=5776
# Problematic frame:
# C  [chrome_elf.dll+0x1b549]  java.lang.ProcessHandleImpl.getProcessPids0""",

    # 5 — GC thread crash (suspected hardware)
    """\
EXCEPTION_ACCESS_VIOLATION (0xc0000005) at pc=0x00007ffd4c6c2580, pid=33548, tid=4488
# Problematic frame:
# V  [jvm.dll+0x3f6d67]
Current thread (0x000002617bfc3730): GCTaskThread "GC Thread#5" [stack: 0x000000777e600000,0x000000777e700000] [id=22192]""",

    # 6 — JBR-A-27 sporadic crash
    """\
# EXCEPTION_ACCESS_VIOLATION (0xc0000005) at pc=0x00007ffcaed3c475, pid=17708, tid=5556
# JRE version: OpenJDK Runtime Environment JBR-17.0.12+1-1087.25-jcef (17.0.12+1) (build 17.0.12+1-b1087.25)
# Java VM: OpenJDK 64-Bit Server VM JBR-17.0.12+1-1087.25-jcef
# Problematic frame:
# V  [jvm.dll+0x36c475]""",

    # 7 — JBR null pointer (back-buffer)
    """\
java.lang.NullPointerException: Cannot invoke "java.awt.image.VolatileImage.getGraphics()" because "this.backBuffers[i]" is null""",
]


# ---------------------------------------------------------------------------
# Command handlers
# ---------------------------------------------------------------------------

def cmd_list_models(model: str) -> None:
    """Print all locally available Ollama models."""
    try:
        models = list_models()
    except Exception as exc:
        print(f"❌ Failed to fetch model list: {exc}")
        return

    print("Locally available models:")
    for name in models:
        marker = " ← current default" if name == model else ""
        print(f"  • {name}{marker}")


def cmd_analyze_log(model: str, log_text: str, *, batch: bool) -> None:
    """Analyse a single log or all built-in demo logs."""
    analyzer = CrashLogAnalyzer(model=model)
    print(f"\n🚀 Starting Crash Analyser  [model: {model}]\n")

    if batch:
        print(f"{'#' * 60}")
        print(f"# Batch mode — {len(DEMO_LOGS)} demo logs")
        print(f"{'#' * 60}\n")

        def _progress(i: int, total: int) -> None:
            print(f"\n[{i}/{total}] Analysing…")

        results = analyzer.batch_analyze(DEMO_LOGS, on_progress=_progress)
        output_path = "batch_results.json"
        with open(output_path, "w", encoding="utf-8") as fh:
            json.dump(results, fh, ensure_ascii=False, indent=2)
        print(f"\n✅ Batch analysis complete — results saved to {output_path}")
    else:
        target = log_text if log_text else DEMO_LOGS[2]  # default: physical OOM
        print(f"{'=' * 60}\n")
        analyzer.analyze(target)


def cmd_analyze_directory(root: str, model: str) -> None:
    """Scan *root* for crash log files and analyse each group."""
    if not os.path.isdir(root):
        print(f"❌ Directory not found: {root}")
        return

    log_files = find_log_files(root)
    if not log_files:
        print(f"\n⚠️  No matching log files found in {root}")
        print(f"   Patterns searched: {', '.join(LOG_FILE_PATTERNS)}")
        return

    print(f"\n{'#' * 60}")
    print(f"# Found {len(log_files)} log file(s)")
    print(f"{'#' * 60}\n")

    groups = group_by_top_level_dir(log_files, root)
    analyzer = CrashLogAnalyzer(model=model)
    results: list[dict] = []
    total = len(groups)

    for idx, (group_key, files) in enumerate(groups.items(), start=1):
        print(f"\n[{idx}/{total}] Group: {group_key}  ({len(files)} file(s))")
        for f in files:
            print(f"   - {os.path.relpath(f, root)}")
        print("-" * 60)

        selected = preferred_files(files)
        combined = merge_log_files(selected, root)

        try:
            analysis = analyzer.analyze_as_dict(combined, stream=True)
            rel_dir = os.path.relpath(os.path.dirname(selected[0]), root)
            analysis["link"] = f'=HYPERLINK("./{rel_dir}", "link")'
            results.append(analysis)
            print("   ✅ Done")
        except Exception as exc:
            print(f"   ❌ Failed: {exc}")

    output_path = os.path.join(root, "analysis_results.json")
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(results, fh, ensure_ascii=False, indent=2)

    output_csv = os.path.join(root, "analysis_results.csv")
    df = pd.DataFrame(results)
    df.to_csv(output_csv, index=False)

    print(f"\n{'=' * 60}")
    print(f"✅ Analysis complete — results saved to {output_path} and {output_csv}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# CLI wiring
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="IDE Crash Log Analyser (Ollama-backed)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Ollama model name (default: {DEFAULT_MODEL})",
    )
    parser.add_argument("--log", default="", help="Crash log text to analyse")
    parser.add_argument("--file", default="", help="Path to a crash log file")
    parser.add_argument(
        "--dir", default="", help="Directory to scan for crash log files"
    )
    parser.add_argument(
        "--batch", action="store_true", help="Batch-analyse all built-in demo logs"
    )
    parser.add_argument(
        "--list-models", action="store_true", help="List locally available Ollama models"
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()

    if args.list_models:
        cmd_list_models(args.model)
        return

    if args.dir:
        cmd_analyze_directory(args.dir, args.model)
        return

    # Resolve log text: --log takes precedence over --file
    log_text = args.log
    if args.file and not log_text:
        with open(args.file, encoding="utf-8", errors="ignore") as fh:
            log_text = fh.read()
        print(f"[Loaded] {args.file} ({len(log_text):,} chars)")

    cmd_analyze_log(args.model, log_text, batch=args.batch)


if __name__ == "__main__":
    main()

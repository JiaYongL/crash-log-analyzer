"""
log_scanner.py

Utilities for finding and grouping crash log files across a directory tree.
"""

from __future__ import annotations

import glob
import os

from config import LOG_FILE_PATTERNS, LOG_HEAD_LINES


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------

def find_log_files(root: str, patterns: list[str] = LOG_FILE_PATTERNS) -> list[str]:
    """
    Recursively find all log files under *root* matching any of *patterns*.

    Returns a sorted, deduplicated list of absolute paths.
    """
    found: set[str] = set()
    for pattern in patterns:
        found.update(glob.glob(os.path.join(root, pattern)))
        found.update(glob.glob(os.path.join(root, "**", pattern), recursive=True))
    return sorted(found)


# ---------------------------------------------------------------------------
# Grouping
# ---------------------------------------------------------------------------

def group_by_top_level_dir(
    log_files: list[str],
    root: str,
) -> dict[str, list[str]]:
    """
    Group *log_files* by their top-level subdirectory relative to *root*.

    Files that live directly inside *root* are grouped under the key ``"root"``.
    Files inside ``root/foo/bar/`` are grouped under ``"foo"``.
    """
    groups: dict[str, list[str]] = {}
    for path in log_files:
        rel = os.path.relpath(os.path.dirname(path), root)
        # Take only the first path component so all variants of foo/* collapse
        top = rel.split(os.sep)[0] if rel != "." else "root"
        groups.setdefault(top, []).append(path)
    return groups


# ---------------------------------------------------------------------------
# Content helpers
# ---------------------------------------------------------------------------

def preferred_files(files: list[str]) -> list[str]:
    """
    From a group of log files, return the ones to actually analyze.

    Priority: ``jbr_err*.log`` files first; fall back to the first file found.
    """
    jbr = [f for f in files if os.path.basename(f).startswith("jbr_err")]
    return jbr if jbr else files[:1]


def read_log_head(path: str, max_lines: int = LOG_HEAD_LINES) -> str:
    """Read the first *max_lines* lines of a log file, ignoring encoding errors."""
    with open(path, encoding="utf-8", errors="ignore") as fh:
        return "".join(fh.readlines()[:max_lines])


def merge_log_files(files: list[str], root: str) -> str:
    """
    Concatenate the heads of multiple log files into a single string, with a
    header line identifying each file.
    """
    parts: list[str] = []
    for path in files:
        header = f"\n\n=== File: {os.path.relpath(path, root)} ===\n"
        parts.append(header + read_log_head(path))
    return "".join(parts)

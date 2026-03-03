"""
config.py

Central configuration for the crash analyzer.
Override via environment variables or edit directly.
"""

import os

# Ollama server
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Default model — change to any locally-pulled Ollama model
DEFAULT_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3:4b")

# How many lines to read from each log file during directory scans
LOG_HEAD_LINES: int = 100

# Log filename patterns to search for during directory scans
LOG_FILE_PATTERNS: list[str] = [
    "jbr_err*.log",
    "java_error*.log",
    "hs_err_pid*.log",
]

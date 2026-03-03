# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an IDE Crash Log Analyzer that uses local Ollama LLM models to parse and diagnose Java/JBR (JetBrains Runtime) crash logs. The system injects a domain-specific knowledge base into the model's system prompt to guide analysis.

## Development Commands

```bash
# Run the analyzer (uses built-in demo log by default)
python main.py

# List available Ollama models
python main.py --list-models

# Analyze a specific log file
python main.py --file path/to/crash.log

# Analyze a log string directly
python main.py --log "Exception in thread..."

# Batch-analyze all built-in demo logs
python main.py --batch

# Scan a directory for crash log files and analyze each group
python main.py --dir /path/to/logs
```

## Architecture

### Module Responsibilities

- **[main.py](main.py)**: CLI entry point using `argparse`. Defines demo logs, command handlers, and orchestrates batch/directory analysis workflows.
- **[analyzer.py](analyzer.py)**: Core `CrashLogAnalyzer` class that wraps the Ollama chat API with the domain-specific system prompt. Handles single and batch analysis.
- **[ollama_client.py](ollama_client.py)**: Thin REST API wrapper for Ollama's `/api/chat` and `/api/tags` endpoints. Handles connection errors, streaming, and JSON mode.
- **[knowledge_base.py](knowledge_base.py)**: Two parallel representations:
  - `KNOWLEDGE_RULES`: Structured list of rule dicts for programmatic use
  - `SYSTEM_PROMPT`: Hand-written prompt for the LLM (kept in sync manually)
  The system prompt instructs the model to classify log type (`hs_err`, `oom`, `exception`, `unknown`) and extract structured fields.
- **[log_scanner.py](log_scanner.py)**: Directory traversal utilities for finding log files by pattern (`jbr_err*.log`, `java_error*.log`, `hs_err_pid*.log`), grouping by top-level directory, and merging file contents.
- **[config.py](config.py)**: Central configuration (Ollama URL, model name, log patterns). Override via environment variables `OLLAMA_BASE_URL` and `OLLAMA_MODEL`.

### Data Flow

1. User provides log text via CLI → `main.py` routes to appropriate command
2. `CrashLogAnalyzer.analyze()` combines system prompt with user message containing the log
3. `ollama_client.chat()` calls Ollama REST API with optional streaming/JSON mode
4. Model returns structured JSON: `log_type`, `exception_type`, `frame_type`, `frame_fingerprint`, `current_thread`, `top_frame_method`, `evidence`

### Key Design Decisions

- **System prompt injection**: Knowledge base is embedded in the system prompt rather than using RAG. Works for small rule sets (< 50 rules).
- **Streaming tokens**: Default behavior streams tokens to stdout as they arrive; can be suppressed with `on_token=lambda _: None`.
- **Group-based directory scanning**: When scanning directories, logs are grouped by top-level subdirectory, with preference for `jbr_err*.log` files over generic patterns.
- **JSON mode**: Uses Ollama's `format: json` parameter to constrain output (model-dependent).

## Configuration

Default Ollama model is `qwen3:4b`. Change via:
- Environment variable: `export OLLAMA_MODEL=llama3:8b`
- Direct edit: Set `DEFAULT_MODEL` in [config.py](config.py:14)

Ollama server URL defaults to `http://localhost:11434`. Change via `OLLAMA_BASE_URL` environment variable.

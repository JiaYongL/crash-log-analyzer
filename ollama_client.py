"""
ollama_client.py

Thin wrapper around the Ollama REST API.
Handles connection errors and streaming, but has no knowledge of crash analysis.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

import requests

from config import DEFAULT_MODEL, OLLAMA_BASE_URL


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _post(
    endpoint: str,
    payload: dict[str, Any],
    stream: bool = False,
    timeout: int = 12_000,
) -> requests.Response:
    """Send a POST request to the Ollama server and return the response."""
    url = f"{OLLAMA_BASE_URL}{endpoint}"
    try:
        resp = requests.post(url, json=payload, stream=stream, timeout=timeout)
        resp.raise_for_status()
        return resp
    except requests.exceptions.ConnectionError as exc:
        raise ConnectionError(
            f"Cannot reach Ollama at {OLLAMA_BASE_URL}. "
            "Is the server running? Try: ollama serve"
        ) from exc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def list_models() -> list[str]:
    """Return the names of all locally available Ollama models."""
    resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10)
    resp.raise_for_status()
    return [m["name"] for m in resp.json().get("models", [])]


def chat(
    messages: list[dict[str, str]],
    *,
    model: str = DEFAULT_MODEL,
    stream: bool = True,
    temperature: float = 0.1,
    json_mode: bool = False,
    on_token: Callable[[str], None] | None = None,
) -> str:
    """
    Call the Ollama ``/api/chat`` endpoint and return the full response text.

    Parameters
    ----------
    messages:
        Conversation turns in ``[{"role": "...", "content": "..."}]`` format.
    model:
        Ollama model identifier.
    stream:
        When *True*, tokens are consumed as they arrive; ``on_token`` is called
        for each one.  When *False*, the full response is returned in one shot.
    temperature:
        Sampling temperature (lower = more deterministic).
    json_mode:
        Ask Ollama to constrain output to valid JSON (model-dependent).
    on_token:
        Optional callback invoked with each streamed token string.
        If *None* and ``stream`` is *True*, tokens are silently accumulated.
    """
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": stream,
        "think": False,
        "options": {"temperature": temperature},
    }
    if json_mode:
        payload["format"] = "json"

    resp = _post("/api/chat", payload, stream=stream)

    if not stream:
        return resp.json()["message"]["content"]

    full_text = ""
    for line in resp.iter_lines():
        if not line:
            continue
        chunk = json.loads(line)
        token: str = chunk.get("message", {}).get("content", "")
        thinking: str = chunk.get("message", {}).get("thinking", "")
        combined = token + thinking
        if combined:
            if on_token is not None:
                on_token(combined)
            full_text += token  # only accumulate the non-thinking part
        if chunk.get("done"):
            break

    return full_text

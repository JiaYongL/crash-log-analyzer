"""
analyzer.py

High-level crash-log analysis using an Ollama language model.
I/O (printing, file writing) is the caller's responsibility;
this module only produces and returns data.
"""

from __future__ import annotations

import json

from config import DEFAULT_MODEL
from knowledge_base import SYSTEM_PROMPT
from ollama_client import chat


class CrashLogAnalyzer:
    """
    Analyze IDE crash logs by injecting a diagnostic knowledge base into the
    system prompt of an Ollama model.

    This approach works well when the rule set is small enough to fit inside the
    context window (roughly < 50 rules / 8 K tokens).
    """

    def __init__(self, model: str = DEFAULT_MODEL) -> None:
        self.model = model
        self._system_message = {"role": "system", "content": SYSTEM_PROMPT}

    # ------------------------------------------------------------------
    # Single-log analysis
    # ------------------------------------------------------------------

    def analyze(
        self,
        crash_log: str,
        *,
        stream: bool = True,
        json_mode: bool = True,
        on_token: object = None,
    ) -> str:
        """
        Analyze one crash log and return the raw model response (a JSON string).

        Parameters
        ----------
        crash_log:
            The full text of the crash log.
        stream:
            Forward streaming tokens to ``on_token`` as they arrive.
        json_mode:
            Request JSON-constrained output from the model.
        on_token:
            Callback ``(token: str) -> None`` for each streamed token.
            Falls back to ``print`` when *stream* is *True* and no callback
            is provided, so callers can suppress output by passing
            ``on_token=lambda _: None``.
        """
        user_message = {
            "role": "user",
            "content": (
                "Analyze the log below and output the crash fingerprint as JSON:\n\n"
                "```\n"
                f"{crash_log.strip()}\n"
                "```"
            ),
        }

        # Default streaming callback: print tokens as they arrive
        token_callback = on_token
        if stream and token_callback is None:
            token_callback = lambda t: print(t, end="", flush=True)  # noqa: E731

        result = chat(
            [self._system_message, user_message],
            model=self.model,
            stream=stream,
            json_mode=json_mode,
            on_token=token_callback,
        )

        if stream:
            print()  # newline after streaming output

        return result

    def analyze_as_dict(self, crash_log: str, **kwargs) -> dict:
        """
        Analyze one crash log and return the parsed JSON result as a dict.

        Raises ``json.JSONDecodeError`` if the model response is not valid JSON.
        """
        raw = self.analyze(crash_log, **kwargs)
        return json.loads(raw)

    # ------------------------------------------------------------------
    # Batch analysis
    # ------------------------------------------------------------------

    def batch_analyze(
        self,
        crash_logs: list[str],
        *,
        stream: bool = False,
        on_progress: object = None,
    ) -> list[dict]:
        """
        Analyze multiple crash logs independently (no shared context between them).

        Parameters
        ----------
        crash_logs:
            List of crash log strings.
        stream:
            Whether to stream each analysis.
        on_progress:
            Optional callback ``(index: int, total: int) -> None`` called before
            each log is analyzed.

        Returns
        -------
        list[dict]
            One entry per log::

                {
                    "index": 1,
                    "log_preview": "...",   # first 200 chars
                    "analysis": {...},      # parsed JSON dict, or None on error
                    "error": None,          # str if parsing/network failed
                }
        """
        results: list[dict] = []
        total = len(crash_logs)

        for i, log in enumerate(crash_logs, start=1):
            if on_progress is not None:
                on_progress(i, total)

            entry: dict = {
                "index": i,
                "log_preview": log[:200] + ("..." if len(log) > 200 else ""),
                "analysis": None,
                "error": None,
            }
            try:
                entry["analysis"] = self.analyze_as_dict(log, stream=stream)
            except json.JSONDecodeError as exc:
                entry["error"] = f"JSON parse error: {exc}"
            except Exception as exc:  # noqa: BLE001
                entry["error"] = str(exc)

            results.append(entry)

        return results

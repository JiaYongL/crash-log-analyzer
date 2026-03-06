import { useState, useRef, useCallback } from "react";
import type { AnalyzerState, LogKind, Phase, ProgressState } from "../types";
import {
  API_URL,
  DEFAULT_MODEL,
  isLogFile,
  PROGRESS_ANIMATION_DURATION_MS,
} from "../constants/config";
import { readDroppedItems } from "../utils/fileSystem";

// ─── useAnalyzer ─────────────────────────────────────────────────────────────

/**
 * Owns all application state and async logic.
 *
 * Components are purely presentational — they call these handlers and render
 * whatever state this hook exposes.  Nothing in this hook touches the DOM
 * or prints to the console.
 */
export function useAnalyzer(): AnalyzerState {
  // ── State ──────────────────────────────────────────────────────────────────
  const [files, setFiles]               = useState<File[]>([]);
  const [model, setModel]               = useState<string>(DEFAULT_MODEL);
  const [phase, setPhase]               = useState<Phase>("idle");
  const [progress, setProgressState]    = useState<ProgressState>({ pct: 0, label: "" });
  const [logs, setLogs]                 = useState<AnalyzerState["logs"]>([]);
  const [downloadUrl, setDownloadUrl]   = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("crash_analysis.zip");

  /** Ref to the indeterminate-progress interval so we can cancel it. */
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Internal helpers ───────────────────────────────────────────────────────

  const pushLog = useCallback((text: string, kind: LogKind = "dim") => {
    setLogs((prev) => [
      ...prev,
      { text, kind, id: Date.now() + Math.random() },
    ]);
  }, []);

  const setProgress = useCallback((pct: number, label?: string) => {
    setProgressState({ pct: Math.round(pct), label: label ?? "" });
  }, []);

  const stopTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  // ── File handling ──────────────────────────────────────────────────────────

  /**
   * Filters `rawFiles` down to recognised log files, then resets all
   * transient state (progress, logs, previous result) ready for a new run.
   */
  const handleFiles = useCallback(
    (rawFiles: File[]) => {
      const filtered = rawFiles.filter((f) => isLogFile(f.name));
      if (filtered.length === 0) {
        pushLog(
          "⚠  No matching log files found (jbr_err*, java_error*, hs_err_pid*, *.log, *.txt)",
          "err"
        );
        return;
      }
      setFiles(filtered);
      setPhase("idle");
      setLogs([]);
      setProgressState({ pct: 0, label: "" });
      setDownloadUrl(null);
    },
    [pushLog]
  );

  /** Handles `<input type="file" webkitdirectory>` change events. */
  const onFolderInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(Array.from(e.target.files));
    },
    [handleFiles]
  );

  /** Handles `<input type="file" multiple>` change events (individual files). */
  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(Array.from(e.target.files));
    },
    [handleFiles]
  );

  /** Handles drop events — resolves directories recursively. */
  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      const resolved = await readDroppedItems(
        Array.from(e.dataTransfer.items)
      );
      handleFiles(resolved);
    },
    [handleFiles]
  );

  // ── Analysis ───────────────────────────────────────────────────────────────

  const runAnalysis = useCallback(async () => {
    if (files.length === 0) return;

    setPhase("loading");
    setLogs([]);
    setProgress(5, "Uploading files…");
    pushLog(`→ Sending ${files.length} file${files.length !== 1 ? "s" : ""} to analyser…`);

    const formData = new FormData();
    formData.append("model", model.trim() || DEFAULT_MODEL);
    files.forEach((f) => {
      // Preserve relative path so the backend can group files by directory.
      formData.append(
        "files",
        f.slice(0, f.size, f.type),
        f.webkitRelativePath || f.name
      );
    });

    setProgress(20, "Running AI analysis…");
    pushLog("→ AI model is processing crash logs — this may take a moment…");

    // Indeterminate sweep: 20 → 85 over PROGRESS_ANIMATION_DURATION_MS
    const animStart = Date.now();
    tickerRef.current = setInterval(() => {
      const t = Math.min(
        (Date.now() - animStart) / PROGRESS_ANIMATION_DURATION_MS,
        1
      );
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setProgress(20 + 65 * eased);
    }, 100);

    try {
      const resp = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      stopTicker();

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Server error ${resp.status}: ${text}`);
      }

      setProgress(90, "Generating archive…");
      pushLog("✓ Analysis complete — building report archive…", "ok");

      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      const name =
        (resp.headers.get("Content-Disposition") ?? "")
          .match(/filename="?([^"]+)"?/)?.[1] ?? "crash_analysis.zip";

      setDownloadUrl(url);
      setDownloadName(name);
      setProgress(100, "Done!");
      pushLog("✓ ZIP archive ready for download.", "ok");

      // Brief pause so the 100% state is visible before the result panel appears.
      setTimeout(() => setPhase("done"), 300);
    } catch (err) {
      stopTicker();
      setProgress(0, "Failed");
      pushLog(`✗ ${err instanceof Error ? err.message : String(err)}`, "err");
      pushLog("Make sure the backend is running: python server.py", "dim");
      setPhase("error");
    }
  }, [files, model, pushLog, setProgress, stopTicker]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    stopTicker();
    setFiles([]);
    setPhase("idle");
    setLogs([]);
    setProgressState({ pct: 0, label: "" });
    setDownloadUrl(null);
    setDownloadName("crash_analysis.zip");
  }, [stopTicker]);

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    files,
    model,
    phase,
    progress,
    logs,
    downloadUrl,
    downloadName,
    setModel,
    onFolderInputChange,
    onFileInputChange,
    onDrop,
    runAnalysis,
    reset,
  };
}

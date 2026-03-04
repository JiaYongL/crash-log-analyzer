import { useRef, useEffect } from "react";
import type { LogEntry, ProgressState } from "../types";

// ─── LogLine ──────────────────────────────────────────────────────────────────

const LOG_KIND_COLOUR: Record<LogEntry["kind"], string> = {
  ok:  "var(--green)",
  err: "var(--red)",
  dim: "var(--text-dim)",
};

interface LogLineProps {
  entry: LogEntry;
}

function LogLine({ entry }: LogLineProps): JSX.Element {
  return (
    <span
      className="anim-fade"
      style={{ display: "block", color: LOG_KIND_COLOUR[entry.kind] }}
    >
      {entry.text}
    </span>
  );
}

// ─── ProgressPanel ────────────────────────────────────────────────────────────

interface ProgressPanelProps {
  progress: ProgressState;
  logs: LogEntry[];
}

/**
 * Renders a labelled progress bar and a scrollable terminal-style log.
 * Auto-scrolls to the bottom whenever a new entry is appended.
 */
export default function ProgressPanel({
  progress,
  logs,
}: ProgressPanelProps): JSX.Element {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="anim-slide"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          {progress.label || "Working…"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>
          {progress.pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          background: "var(--border)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress.pct}%`,
            background: "linear-gradient(90deg, var(--amber-dim), var(--amber))",
            borderRadius: 99,
            transition: "width .4s ease",
          }}
        />
      </div>

      {/* Terminal log */}
      <div
        ref={logRef}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 18px",
          fontSize: 12,
          maxHeight: 200,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          scrollbarWidth: "thin",
        }}
      >
        {logs.map((entry) => (
          <LogLine key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

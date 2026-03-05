import { useRef, useEffect } from "react";
import type { LogEntry, ProgressState } from "../types";

const KIND_STYLE: Record<LogEntry["kind"], { color: string; prefix: string }> = {
  ok:  { color: "var(--green)",    prefix: "✓ " },
  err: { color: "var(--red)",      prefix: "✗ " },
  dim: { color: "var(--text-dim)", prefix: ""    },
};

function LogLine({ entry }: { entry: LogEntry }): JSX.Element {
  const s = KIND_STYLE[entry.kind];
  return (
    <div className="anim-fade" style={{
      display: "flex", gap: 6, padding: "2px 0",
      fontSize: 12.5, lineHeight: 1.55, color: s.color, fontFamily: "var(--mono)",
    }}>
      <span style={{ flexShrink: 0, opacity: .7 }}>{s.prefix}</span>
      <span style={{ wordBreak: "break-all" }}>{entry.text}</span>
    </div>
  );
}

export default function ProgressPanel({ progress, logs }: { progress: ProgressState; logs: LogEntry[] }): JSX.Element {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const isRunning = progress.pct > 0 && progress.pct < 100;

  return (
    <div className="anim-slide" style={{ display: "flex", flexDirection: "column", gap: 12,
      background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)",
      padding: "20px 20px 18px", boxShadow: "var(--shadow-sm)" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-mid)" }}>
          {progress.label || "Processing…"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--mono)" }}>
          {progress.pct}%
        </span>
      </div>

      {/* Progress track */}
      <div style={{ height: 4, background: "var(--surface-sub)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress.pct}%`,
          borderRadius: 99,
          background: progress.pct === 100
            ? "var(--green)"
            : "linear-gradient(90deg, var(--accent-dark), var(--accent))",
          transition: "width .4s cubic-bezier(.4,0,.2,1)",
          animation: isRunning ? "pulse-bar 2s ease-in-out infinite" : "none",
        }}/>
      </div>

      {/* Log output */}
      <div ref={logRef} style={{
        maxHeight: 180, overflowY: "auto", scrollbarWidth: "thin",
        background: "var(--surface-alt)", borderRadius: 8,
        border: "1px solid var(--border)", padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 1,
      }}>
        {logs.length === 0
          ? <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>Waiting…</span>
          : logs.map(e => <LogLine key={e.id} entry={e}/>)
        }
      </div>
    </div>
  );
}

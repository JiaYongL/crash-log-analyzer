// ─── Application phase ────────────────────────────────────────────────────────

/** Describes the current lifecycle stage of an analysis run. */
export type Phase = "idle" | "loading" | "done" | "error";

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressState {
  /** 0–100 */
  pct: number;
  /** Short human-readable status label shown above the bar. */
  label: string;
}

// ─── Log output ───────────────────────────────────────────────────────────────

/** Semantic colour intent for a terminal log line. */
export type LogKind = "ok" | "err" | "dim";

export interface LogEntry {
  /** Stable unique id for React reconciliation. */
  id: number;
  text: string;
  kind: LogKind;
}

// ─── Analyser hook public API ─────────────────────────────────────────────────

export interface AnalyzerState {
  // Data
  files: File[];
  model: string;
  phase: Phase;
  progress: ProgressState;
  logs: LogEntry[];
  downloadUrl: string | null;
  downloadName: string;
  // Actions
  setModel: (model: string) => void;
  onFolderInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputChange:   (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop:              (e: React.DragEvent<HTMLElement>) => Promise<void>;
  runAnalysis: () => Promise<void>;
  reset: () => void;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const API_URL       = "http://localhost:5050" as const;
export const DEFAULT_MODEL = "qwen3:4b"             as const;

// ─── Log-file filtering ───────────────────────────────────────────────────────

/** Filename patterns that qualify a file as a crash log. */
export const LOG_PATTERNS: readonly RegExp[] = [
  /^jbr_err/i,
  /^java_error/i,
] as const;

/** Returns `true` when `name` matches any known crash-log pattern. */
export const isLogFile = (name: string): boolean =>
  LOG_PATTERNS.some((p) => p.test(name));

// ─── Progress animation ───────────────────────────────────────────────────────

/**
 * Duration (ms) over which the indeterminate progress bar sweeps from 20 → 85.
 * Intentionally generous — real analysis can take 30–60 s depending on model.
 */
export const PROGRESS_ANIMATION_DURATION_MS = 40_000 as const;

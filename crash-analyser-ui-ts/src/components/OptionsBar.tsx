// ─── Props ────────────────────────────────────────────────────────────────────

interface OptionsBarProps {
  model: string;
  onModelChange: (value: string) => void;
}

// ─── OptionsBar ───────────────────────────────────────────────────────────────

/**
 * Controlled model-name input.
 * Uses inline `onFocus` / `onBlur` to keep the focus ring in the brand colour
 * without requiring a dedicated CSS class.
 */
export default function OptionsBar({
  model,
  onModelChange,
}: OptionsBarProps): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <label
        htmlFor="modelInput"
        style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}
      >
        Ollama model
      </label>

      <input
        id="modelInput"
        type="text"
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        placeholder="e.g. qwen3:4b"
        style={{
          flex: 1,
          minWidth: 180,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "9px 14px",
          color: "var(--text)",
          fontFamily: "var(--mono)",
          fontSize: 13,
          outline: "none",
          transition: "border-color .2s",
        }}
        onFocus={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = "var(--amber)")
        }
        onBlur={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = "var(--border)")
        }
      />
    </div>
  );
}

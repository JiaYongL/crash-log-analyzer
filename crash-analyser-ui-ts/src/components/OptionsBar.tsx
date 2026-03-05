interface Props { model: string; onModelChange: (v: string) => void; }

export default function OptionsBar({ model, onModelChange }: Props): JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "12px 16px", boxShadow: "var(--shadow-xs)" }}>
      <label htmlFor="modelInput" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-mid)", whiteSpace: "nowrap" }}>
        Ollama model
      </label>
      <input
        id="modelInput" type="text" value={model} placeholder="e.g. qwen3:4b"
        onChange={(e) => onModelChange(e.target.value)}
        style={{ flex: 1, minWidth: 180, padding: "7px 12px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--surface-alt)",
          color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13,
          outline: "none", transition: "border-color .15s, box-shadow .15s" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-ring)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

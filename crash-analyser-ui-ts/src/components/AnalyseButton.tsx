import { useState } from "react";
import { IconSparkle } from "../icons";

export default function AnalyseButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }): JSX.Element {
  const [hover, setHover] = useState(false);
  const active = !disabled && hover;
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "13px 24px",
        borderRadius: 10,
        background: disabled ? "var(--surface-sub)" : active
          ? "var(--accent-dark)"
          : "var(--accent)",
        color: disabled ? "var(--text-dim)" : "#fff",
        fontFamily: "var(--sans)", fontSize: 15, fontWeight: 600,
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: active ? "0 4px 16px rgba(217,119,87,.35)" : disabled ? "none" : "0 2px 6px rgba(217,119,87,.25)",
        transform: active ? "translateY(-1px)" : "translateY(0)",
        transition: "background .15s, box-shadow .15s, transform .15s, color .15s",
      }}
    >
      {!disabled && <IconSparkle/>}
      {disabled ? "Select files to analyse" : "Analyse & Export Excel"}
    </button>
  );
}

import { useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnalyseButtonProps {
  disabled: boolean;
  onClick: () => void;
}

// ─── AnalyseButton ────────────────────────────────────────────────────────────

/**
 * Full-width primary CTA.
 *
 * Manages its own `hover` state so parent components don't re-render on every
 * mouse-enter / leave event.
 */
export default function AnalyseButton({
  disabled,
  onClick,
}: AnalyseButtonProps): JSX.Element {
  const [hover, setHover] = useState(false);
  const isActive = !disabled && hover;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        padding: "16px 24px",
        borderRadius: 12,
        background: "var(--amber)",
        color: "#000",
        fontFamily: "var(--sans)",
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: ".02em",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transform: isActive ? "translateY(-1px)" : "none",
        boxShadow: isActive ? "0 8px 30px rgba(245,166,35,.25)" : "none",
        transition: "opacity .15s, transform .15s, box-shadow .2s",
      }}
    >
      Analyse &amp; Export Excel →
    </button>
  );
}

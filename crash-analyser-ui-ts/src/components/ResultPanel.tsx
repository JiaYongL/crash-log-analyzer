import { IconCheck, IconDownload } from "../icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResultPanelProps {
  fileCount:    number;
  downloadUrl:  string;
  downloadName: string;
  onReset:      () => void;
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────

/**
 * Success state: check icon, summary, Excel download link, and reset button.
 */
export default function ResultPanel({
  fileCount,
  downloadUrl,
  downloadName,
  onReset,
}: ResultPanelProps): JSX.Element {
  return (
    <div
      className="anim-slide"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      {/* Success icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(57,217,138,.12)",
          border: "1.5px solid rgba(57,217,138,.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconCheck />
      </div>

      <h2
        style={{
          fontFamily: "var(--sans)",
          fontSize: 22,
          fontWeight: 800,
          color: "#eaf0ff",
        }}
      >
        Analysis complete
      </h2>

      <p style={{ color: "var(--text-dim)", fontSize: 13, maxWidth: 380 }}>
        Analysed {fileCount} log file{fileCount !== 1 ? "s" : ""}. Your Excel
        report is ready.
      </p>

      {/* Download link styled as a button */}
      <a
        href={downloadUrl}
        download={downloadName}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 32px",
          borderRadius: 10,
          background: "var(--green)",
          color: "#000",
          fontFamily: "var(--mono)",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(57,217,138,.2)",
          transition: "opacity .15s, transform .15s, box-shadow .2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.opacity   = ".9";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 12px 32px rgba(57,217,138,.3)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.opacity   = "1";
          el.style.transform = "none";
          el.style.boxShadow = "0 8px 24px rgba(57,217,138,.2)";
        }}
      >
        <IconDownload /> Download .xlsx
      </a>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 18px",
          color: "var(--text-dim)",
          fontFamily: "var(--mono)",
          fontSize: 12,
          cursor: "pointer",
          transition: "border-color .2s, color .2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = "var(--text-dim)";
          el.style.color       = "var(--text)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = "var(--border)";
          el.style.color       = "var(--text-dim)";
        }}
      >
        Analyse another batch
      </button>
    </div>
  );
}
